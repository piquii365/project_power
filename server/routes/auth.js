import express from 'express'
import { User } from '../models/index.js'
import { generateToken } from '../middleware/auth.js'
import { validateRequest, schemas } from '../middleware/validation.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// Register
router.post('/register', authLimiter, validateRequest(schemas.register), async (req, res) => {
  try {
    const { email, password, firstName, lastName, department, position, phone, location } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      department,
      position,
      phone,
      location,
      startDate: new Date(),
      avatar: `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`
    })

    // Generate token
    const token = generateToken(user.id)

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.getFullName(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      startDate: user.startDate,
      progress: user.onboardingProgress
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login
router.post('/login', authLimiter, validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ where: { email, isActive: true } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    // Generate token
    const token = generateToken(user.id)

    // Return user data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.getFullName(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      startDate: user.startDate,
      progress: user.onboardingProgress,
      lastLogin: user.lastLogin
    }

    res.json({
      message: 'Login successful',
      user: userData,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const newToken = generateToken(user.id)
    
    res.json({ token: newToken })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
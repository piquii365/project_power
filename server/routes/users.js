import express from 'express'
import { User, UserTask, OnboardingTask } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateRequest, schemas } from '../middleware/validation.js'
import { Op } from 'sequelize'

const router = express.Router()

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: UserTask,
        as: 'tasks',
        include: [{
          model: OnboardingTask,
          as: 'task'
        }]
      }]
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Calculate progress statistics
    const completedTasks = user.tasks.filter(task => task.status === 'completed').length
    const totalTasks = user.tasks.length
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const userData = {
      ...user.toJSON(),
      name: user.getFullName(),
      stats: {
        completedTasks,
        totalTasks,
        progressPercentage,
        tasksInProgress: user.tasks.filter(task => task.status === 'in_progress').length,
        overdueTasks: user.tasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
        ).length
      }
    }

    res.json(userData)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile
router.put('/profile', authenticate, validateRequest(schemas.updateProfile), async (req, res) => {
  try {
    const { firstName, lastName, department, position, phone, location, preferences } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      department: department || user.department,
      position: position || user.position,
      phone: phone || user.phone,
      location: location || user.location,
      preferences: preferences || user.preferences
    })

    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    })

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser.toJSON(),
        name: updatedUser.getFullName()
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new team member (HR Admin only)
router.post('/', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      department, 
      position, 
      role, 
      location, 
      startDate,
      manager,
      emergencyContact,
      preferences 
    } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Generate default password (should be changed on first login)
    const defaultPassword = 'TempPass123!'

    // Create user
    const user = await User.create({
      email,
      password: defaultPassword,
      firstName,
      lastName,
      role: role || 'new_hire',
      department,
      position,
      phone,
      location,
      startDate: startDate ? new Date(startDate) : new Date(),
      avatar: `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`,
      preferences: {
        ...preferences,
        emergencyContact: emergencyContact || {},
        manager: manager || null
      }
    })

    // Auto-assign default onboarding tasks for new hires
    if (role === 'new_hire') {
      await assignDefaultTasks(user.id, department)
    }

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
      message: 'Team member created successfully',
      user: userData,
      defaultPassword: defaultPassword // In production, send this via secure email
    })
  } catch (error) {
    console.error('Create team member error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to assign default tasks
async function assignDefaultTasks(userId, department) {
  try {
    // Get default tasks for all new hires
    const defaultTasks = await OnboardingTask.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { requiredRole: null },
          { requiredRole: 'new_hire' },
          { requiredDepartment: null },
          { requiredDepartment: department }
        ]
      },
      order: [['priority', 'DESC'], ['order', 'ASC']]
    })

    // Create user task assignments
    const userTasks = defaultTasks.map(task => {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (task.order * 2)) // Stagger due dates

      return {
        userId,
        taskId: task.id,
        dueDate
      }
    })

    await UserTask.bulkCreate(userTasks)
    console.log(`Assigned ${userTasks.length} default tasks to user ${userId}`)
  } catch (error) {
    console.error('Error assigning default tasks:', error)
  }
}

// Get all users (HR Admin only)
router.get('/', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, department, search } = req.query
    const offset = (page - 1) * limit

    const whereClause = { isActive: true }
    
    if (role) whereClause.role = role
    if (department) whereClause.department = department
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [{
        model: UserTask,
        as: 'tasks',
        attributes: ['status'],
        include: [{
          model: OnboardingTask,
          as: 'task',
          attributes: ['title', 'category']
        }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    })

    const usersWithStats = users.map(user => ({
      ...user.toJSON(),
      name: user.getFullName(),
      stats: {
        completedTasks: user.tasks.filter(task => task.status === 'completed').length,
        totalTasks: user.tasks.length,
        progressPercentage: user.tasks.length > 0 ? 
          Math.round((user.tasks.filter(task => task.status === 'completed').length / user.tasks.length) * 100) : 0
      }
    }))

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: offset + limit < count,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user by ID (HR Admin only)
router.get('/:id', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: UserTask,
        as: 'tasks',
        include: [{
          model: OnboardingTask,
          as: 'task'
        }]
      }]
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const userData = {
      ...user.toJSON(),
      name: user.getFullName(),
      stats: {
        completedTasks: user.tasks.filter(task => task.status === 'completed').length,
        totalTasks: user.tasks.length,
        progressPercentage: user.tasks.length > 0 ? 
          Math.round((user.tasks.filter(task => task.status === 'completed').length / user.tasks.length) * 100) : 0
      }
    }

    res.json(userData)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user role (HR Admin only)
router.put('/:id/role', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { role } = req.body
    
    if (!['new_hire', 'employee', 'manager', 'hr_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await user.update({ role })

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        name: user.getFullName(),
        role: user.role
      }
    })
  } catch (error) {
    console.error('Update user role error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Deactivate user (HR Admin only)
router.delete('/:id', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await user.update({ isActive: false })

    res.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Deactivate user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // In real implementation, validate token with backend
          const mockUser = {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@zhdconsulting.com',
            role: 'new_hire',
            department: 'Engineering',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
            startDate: '2024-01-15',
            progress: 65
          }
          setUser(mockUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      // Mock login - replace with real API call
      if (email && password) {
        const mockUser = {
          id: 1,
          name: email.includes('hr') ? 'Sarah Wilson' : 'John Doe',
          email: email,
          role: email.includes('hr') ? 'hr_admin' : 'new_hire',
          department: email.includes('hr') ? 'Human Resources' : 'Engineering',
          avatar: email.includes('hr') 
            ? 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
            : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
          startDate: '2024-01-15',
          progress: email.includes('hr') ? 100 : 65
        }
        
        localStorage.setItem('token', 'mock-jwt-token')
        setUser(mockUser)
        return { success: true }
      }
      throw new Error('Invalid credentials')
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
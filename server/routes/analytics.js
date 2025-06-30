import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { User, UserTask, OnboardingTask, ChatMessage, Analytics } from '../models/index.js'
import { Op } from 'sequelize'
import sequelize from '../config/database.js'

const router = express.Router()

// Get overview analytics (HR Admin only)
router.get('/overview', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query
    const days = parseInt(timeframe.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Total new hires in timeframe
    const totalHires = await User.count({
      where: {
        role: 'new_hire',
        createdAt: { [Op.gte]: startDate }
      }
    })

    // Average onboarding time
    const completedOnboarding = await User.findAll({
      where: {
        onboardingProgress: 100,
        createdAt: { [Op.gte]: startDate }
      },
      include: [{
        model: UserTask,
        as: 'tasks',
        where: { status: 'completed' },
        include: [{
          model: OnboardingTask,
          as: 'task'
        }]
      }]
    })

    let totalOnboardingTime = 0
    completedOnboarding.forEach(user => {
      const startDate = new Date(user.createdAt)
      const lastCompletedTask = user.tasks.reduce((latest, task) => {
        return new Date(task.completedAt) > new Date(latest.completedAt) ? task : latest
      }, user.tasks[0])
      
      if (lastCompletedTask) {
        const days = Math.ceil((new Date(lastCompletedTask.completedAt) - startDate) / (1000 * 60 * 60 * 24))
        totalOnboardingTime += days
      }
    })

    const avgOnboardingTime = completedOnboarding.length > 0 ? 
      (totalOnboardingTime / completedOnboarding.length).toFixed(1) : 0

    // Completion rate
    const allNewHires = await User.count({
      where: {
        role: 'new_hire',
        createdAt: { [Op.gte]: startDate }
      }
    })

    const completionRate = allNewHires > 0 ? 
      Math.round((completedOnboarding.length / allNewHires) * 100) : 0

    // Satisfaction score (based on task ratings)
    const taskRatings = await UserTask.findAll({
      where: {
        rating: { [Op.ne]: null },
        updatedAt: { [Op.gte]: startDate }
      },
      attributes: ['rating']
    })

    const avgSatisfaction = taskRatings.length > 0 ?
      (taskRatings.reduce((sum, task) => sum + task.rating, 0) / taskRatings.length).toFixed(1) : 0

    // Calculate trends (compare with previous period)
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - days)

    const prevHires = await User.count({
      where: {
        role: 'new_hire',
        createdAt: { 
          [Op.gte]: prevStartDate,
          [Op.lt]: startDate
        }
      }
    })

    const hiresGrowth = prevHires > 0 ? 
      Math.round(((totalHires - prevHires) / prevHires) * 100) : 0

    res.json({
      totalHires,
      avgOnboardingTime: parseFloat(avgOnboardingTime),
      completionRate,
      satisfaction: parseFloat(avgSatisfaction),
      trends: {
        hires: hiresGrowth,
        time: -15, // Mock data - would calculate actual trend
        completion: 8, // Mock data
        satisfaction: 3 // Mock data
      }
    })
  } catch (error) {
    console.error('Analytics overview error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get onboarding progress data
router.get('/progress', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query
    const days = parseInt(timeframe.replace('d', ''))
    
    // Get progress data over time (weekly intervals)
    const weeks = Math.ceil(days / 7)
    const progressData = []
    
    for (let i = weeks; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      const completedTasks = await UserTask.count({
        where: {
          status: 'completed',
          completedAt: {
            [Op.gte]: weekStart,
            [Op.lt]: weekEnd
          }
        }
      })
      
      const totalTasks = await UserTask.count({
        where: {
          createdAt: { [Op.lt]: weekEnd }
        }
      })
      
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      progressData.push({
        week: `Week ${weeks - i + 1}`,
        completionRate
      })
    }

    res.json({
      labels: progressData.map(d => d.week),
      datasets: [{
        label: 'Completion Rate %',
        data: progressData.map(d => d.completionRate),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    })
  } catch (error) {
    console.error('Progress analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get department breakdown
router.get('/departments', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query
    const days = parseInt(timeframe.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const departmentData = await User.findAll({
      where: {
        role: 'new_hire',
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['department'],
      raw: true
    })

    const labels = departmentData.map(d => d.department || 'Unassigned')
    const data = departmentData.map(d => parseInt(d.count))
    
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)'
    ]

    res.json({
      labels,
      datasets: [{
        label: 'New Hires',
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0
      }]
    })
  } catch (error) {
    console.error('Department analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get task completion rates
router.get('/tasks', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const taskStats = await OnboardingTask.findAll({
      attributes: [
        'title',
        'category',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM UserTask
            WHERE UserTask.taskId = OnboardingTask.id
            AND UserTask.status = 'completed'
          )`),
          'completedCount'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM UserTask
            WHERE UserTask.taskId = OnboardingTask.id
          )`),
          'totalAssigned'
        ]
      ],
      raw: true
    })

    const taskData = taskStats
      .filter(task => task.totalAssigned > 0)
      .map(task => ({
        title: task.title,
        category: task.category,
        completionRate: Math.round((task.completedCount / task.totalAssigned) * 100)
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 10) // Top 10 tasks

    res.json({
      labels: taskData.map(t => t.title),
      datasets: [{
        label: 'Completion Rate %',
        data: taskData.map(t => t.completionRate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }]
    })
  } catch (error) {
    console.error('Task analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get engagement metrics
router.get('/engagement', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query
    const days = parseInt(timeframe.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // AI Chat usage
    const totalUsers = await User.count({ where: { role: 'new_hire' } })
    const chatUsers = await ChatMessage.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('userId')), 'userId']],
      raw: true
    })
    const aiChatUsage = totalUsers > 0 ? Math.round((chatUsers.length / totalUsers) * 100) : 0

    // Resource access (mock data - would track actual resource views)
    const resourceAccess = 92

    // Task engagement
    const engagedUsers = await UserTask.findAll({
      where: {
        updatedAt: { [Op.gte]: startDate },
        status: { [Op.in]: ['in_progress', 'completed'] }
      },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('userId')), 'userId']],
      raw: true
    })
    const taskEngagement = totalUsers > 0 ? Math.round((engagedUsers.length / totalUsers) * 100) : 0

    // Feedback score
    const feedbackMessages = await ChatMessage.findAll({
      where: {
        feedback: { [Op.ne]: null },
        createdAt: { [Op.gte]: startDate }
      }
    })
    
    const helpfulCount = feedbackMessages.filter(m => m.feedback === 'helpful').length
    const feedbackScore = feedbackMessages.length > 0 ? 
      ((helpfulCount / feedbackMessages.length) * 5).toFixed(1) : 4.2

    res.json({
      aiChatUsage,
      resourceAccess,
      taskEngagement,
      feedbackScore: parseFloat(feedbackScore)
    })
  } catch (error) {
    console.error('Engagement analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user activity analytics
router.get('/activity', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query
    const days = parseInt(timeframe.replace('d', ''))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const activities = await Analytics.findAll({
      where: {
        timestamp: { [Op.gte]: startDate }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'avatar']
      }],
      order: [['timestamp', 'DESC']],
      limit: 50
    })

    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.eventType,
      message: this.formatActivityMessage(activity),
      time: activity.timestamp,
      user: activity.user ? {
        name: `${activity.user.firstName} ${activity.user.lastName}`,
        avatar: activity.user.avatar
      } : null
    }))

    res.json(formattedActivities)
  } catch (error) {
    console.error('Activity analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to format activity messages
function formatActivityMessage(activity) {
  const eventData = activity.eventData || {}
  const userName = activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'User'
  
  switch (activity.eventType) {
    case 'task_completed':
      return `${userName} completed "${eventData.taskTitle}"`
    case 'task_started':
      return `${userName} started "${eventData.taskTitle}"`
    case 'chat_interaction':
      return `${userName} used AI assistant`
    case 'login':
      return `${userName} logged in`
    case 'profile_updated':
      return `${userName} updated their profile`
    default:
      return `${userName} performed ${activity.eventType}`
  }
}

export default router
import { User, OnboardingTask, UserTask, Analytics } from '../models/index.js'
import { Op } from 'sequelize'

class RecommendationService {
  async getPersonalizedRecommendations(userId) {
    try {
      const user = await User.findByPk(userId, {
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
        throw new Error('User not found')
      }

      // Get user's completed and in-progress tasks
      const completedTasks = user.tasks.filter(ut => ut.status === 'completed')
      const inProgressTasks = user.tasks.filter(ut => ut.status === 'in_progress')
      
      // Get all available tasks for the user's role and department
      const availableTasks = await OnboardingTask.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { requiredRole: null },
            { requiredRole: user.role },
            { requiredDepartment: null },
            { requiredDepartment: user.department }
          ]
        },
        order: [['priority', 'DESC'], ['order', 'ASC']]
      })

      // Filter out already assigned tasks
      const assignedTaskIds = user.tasks.map(ut => ut.taskId)
      const unassignedTasks = availableTasks.filter(task => !assignedTaskIds.includes(task.id))

      // Generate recommendations based on multiple factors
      const recommendations = await this.generateRecommendations(user, unassignedTasks, completedTasks)

      return recommendations
    } catch (error) {
      console.error('Recommendation Service Error:', error)
      throw error
    }
  }

  async generateRecommendations(user, availableTasks, completedTasks) {
    const recommendations = []

    for (const task of availableTasks) {
      const score = await this.calculateRecommendationScore(user, task, completedTasks)
      
      if (score > 0.3) { // Threshold for recommendations
        recommendations.push({
          id: task.id,
          title: task.title,
          description: task.description,
          type: task.type,
          category: task.category,
          priority: this.mapPriorityToRecommendation(task.priority, score),
          estimatedTime: `${task.estimatedDuration} min`,
          score: score,
          reasons: this.generateRecommendationReasons(user, task, score)
        })
      }
    }

    // Sort by score and return top 5
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  async calculateRecommendationScore(user, task, completedTasks) {
    let score = 0.5 // Base score

    // Priority weight
    const priorityWeights = { high: 0.3, medium: 0.2, low: 0.1 }
    score += priorityWeights[task.priority] || 0.1

    // Role/Department match
    if (task.requiredRole === user.role) score += 0.2
    if (task.requiredDepartment === user.department) score += 0.2

    // Prerequisites check
    if (task.prerequisites && task.prerequisites.length > 0) {
      const completedTaskIds = completedTasks.map(ct => ct.taskId)
      const prerequisitesMet = task.prerequisites.every(prereq => 
        completedTaskIds.includes(prereq)
      )
      if (!prerequisitesMet) score -= 0.4
    }

    // User progress factor
    const progressFactor = user.onboardingProgress / 100
    if (task.category === 'company' && progressFactor < 0.2) score += 0.2
    if (task.category === 'technical' && progressFactor > 0.5) score += 0.1

    // Time-based factors
    const daysSinceStart = user.startDate ? 
      Math.floor((new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)) : 0
    
    if (task.category === 'security' && daysSinceStart < 3) score += 0.3
    if (task.category === 'project' && daysSinceStart > 7) score += 0.2

    // Collaborative filtering (similar users)
    const similarUserBonus = await this.getSimilarUserBonus(user, task)
    score += similarUserBonus

    return Math.min(score, 1.0) // Cap at 1.0
  }

  async getSimilarUserBonus(user, task) {
    try {
      // Find users with similar role and department who completed this task
      const similarUsers = await User.findAll({
        where: {
          role: user.role,
          department: user.department,
          id: { [Op.ne]: user.id }
        },
        include: [{
          model: UserTask,
          as: 'tasks',
          where: {
            taskId: task.id,
            status: 'completed'
          },
          required: true
        }]
      })

      // Bonus based on how many similar users completed this task
      const completionRate = similarUsers.length / Math.max(await User.count({
        where: { role: user.role, department: user.department }
      }), 1)

      return completionRate * 0.2 // Max bonus of 0.2
    } catch (error) {
      console.error('Similar user bonus calculation error:', error)
      return 0
    }
  }

  mapPriorityToRecommendation(taskPriority, score) {
    if (score > 0.8) return 'high'
    if (score > 0.6) return 'medium'
    return 'low'
  }

  generateRecommendationReasons(user, task, score) {
    const reasons = []

    if (task.priority === 'high') {
      reasons.push('High priority task for your role')
    }

    if (task.requiredRole === user.role) {
      reasons.push('Specifically designed for your role')
    }

    if (task.requiredDepartment === user.department) {
      reasons.push('Important for your department')
    }

    const daysSinceStart = user.startDate ? 
      Math.floor((new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)) : 0

    if (task.category === 'security' && daysSinceStart < 3) {
      reasons.push('Critical for early onboarding')
    }

    if (score > 0.7) {
      reasons.push('Highly recommended based on your profile')
    }

    return reasons.slice(0, 3) // Return top 3 reasons
  }

  async trackRecommendationInteraction(userId, taskId, action) {
    try {
      await Analytics.create({
        userId,
        eventType: 'recommendation_interaction',
        eventData: {
          taskId,
          action, // 'viewed', 'started', 'dismissed'
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('Error tracking recommendation interaction:', error)
    }
  }

  async getRecommendationAnalytics(timeframe = '30d') {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeframe.replace('d', '')))

    const interactions = await Analytics.findAll({
      where: {
        eventType: 'recommendation_interaction',
        createdAt: { [Op.gte]: startDate }
      }
    })

    const analytics = {
      totalInteractions: interactions.length,
      actionBreakdown: {},
      topRecommendedTasks: {},
      conversionRate: 0
    }

    let startedCount = 0
    interactions.forEach(interaction => {
      const action = interaction.eventData.action
      analytics.actionBreakdown[action] = (analytics.actionBreakdown[action] || 0) + 1
      
      if (action === 'started') startedCount++
      
      const taskId = interaction.eventData.taskId
      analytics.topRecommendedTasks[taskId] = (analytics.topRecommendedTasks[taskId] || 0) + 1
    })

    analytics.conversionRate = interactions.length > 0 ? 
      (startedCount / interactions.length) * 100 : 0

    return analytics
  }
}

export default new RecommendationService()
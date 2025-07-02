import express from 'express'
import { OnboardingTask, UserTask, User } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateRequest, schemas } from '../middleware/validation.js'
import recommendationService from '../services/recommendationService.js'
import { Op } from 'sequelize'

const router = express.Router()

// Get user's onboarding tasks
router.get('/tasks', authenticate, async (req, res) => {
  try {
    const { status, category, priority } = req.query
    
    const whereClause = { userId: req.user.id }
    if (status) whereClause.status = status

    const taskWhereClause = { isActive: true }
    if (category) taskWhereClause.category = category
    if (priority) taskWhereClause.priority = priority

    const userTasks = await UserTask.findAll({
      where: whereClause,
      include: [{
        model: OnboardingTask,
        as: 'task',
        where: taskWhereClause
      }],
      order: [
        [{ model: OnboardingTask, as: 'task' }, 'priority', 'DESC'],
        [{ model: OnboardingTask, as: 'task' }, 'order', 'ASC']
      ]
    })

    const tasksWithDetails = userTasks.map(userTask => ({
      id: userTask.id,
      taskId: userTask.taskId,
      title: userTask.task.title,
      description: userTask.task.description,
      type: userTask.task.type,
      category: userTask.task.category,
      priority: userTask.task.priority,
      estimatedDuration: userTask.task.estimatedDuration,
      status: userTask.status,
      progress: userTask.progress,
      startedAt: userTask.startedAt,
      completedAt: userTask.completedAt,
      timeSpent: userTask.timeSpent,
      dueDate: userTask.dueDate,
      feedback: userTask.feedback,
      rating: userTask.rating,
      notes: userTask.notes,
      content: userTask.task.content,
      resources: userTask.task.resources
    }))

    res.json(tasksWithDetails)
  } catch (error) {
    console.error('Get onboarding tasks error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new onboarding task (HR Admin only)
router.post('/tasks', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      priority,
      estimatedDuration,
      requiredRole,
      requiredDepartment,
      prerequisites,
      content,
      resources
    } = req.body

    // Validate required fields
    if (!title || !type || !category || !estimatedDuration) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get the next order number
    const lastTask = await OnboardingTask.findOne({
      order: [['order', 'DESC']]
    })
    const nextOrder = lastTask ? lastTask.order + 1 : 1

    // Create the task
    const task = await OnboardingTask.create({
      title,
      description,
      type,
      category,
      priority: priority || 'medium',
      estimatedDuration,
      requiredRole,
      requiredDepartment,
      prerequisites: prerequisites || [],
      content: content || {},
      resources: resources || [],
      order: nextOrder,
      isActive: true
    })

    // Auto-assign to eligible users if it's a general task
    if (!requiredRole && !requiredDepartment) {
      await autoAssignTaskToUsers(task.id)
    } else if (requiredRole || requiredDepartment) {
      await autoAssignTaskToEligibleUsers(task.id, requiredRole, requiredDepartment)
    }

    res.status(201).json({
      message: 'Task created successfully',
      task: task.toJSON()
    })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to auto-assign task to all active users
async function autoAssignTaskToUsers(taskId) {
  try {
    const activeUsers = await User.findAll({
      where: { isActive: true },
      attributes: ['id']
    })

    const userTasks = activeUsers.map(user => {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7) // Default 7 days from now

      return {
        userId: user.id,
        taskId,
        dueDate
      }
    })

    await UserTask.bulkCreate(userTasks, { ignoreDuplicates: true })
    console.log(`Auto-assigned task ${taskId} to ${userTasks.length} users`)
  } catch (error) {
    console.error('Error auto-assigning task:', error)
  }
}

// Helper function to auto-assign task to eligible users
async function autoAssignTaskToEligibleUsers(taskId, requiredRole, requiredDepartment) {
  try {
    const whereClause = { isActive: true }
    
    if (requiredRole) whereClause.role = requiredRole
    if (requiredDepartment) whereClause.department = requiredDepartment

    const eligibleUsers = await User.findAll({
      where: whereClause,
      attributes: ['id']
    })

    const userTasks = eligibleUsers.map(user => {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7) // Default 7 days from now

      return {
        userId: user.id,
        taskId,
        dueDate
      }
    })

    await UserTask.bulkCreate(userTasks, { ignoreDuplicates: true })
    console.log(`Auto-assigned task ${taskId} to ${userTasks.length} eligible users`)
  } catch (error) {
    console.error('Error auto-assigning task to eligible users:', error)
  }
}

// Get all onboarding tasks (HR Admin only)
router.get('/tasks/all', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { category, priority, type, active } = req.query
    
    const whereClause = {}
    if (category) whereClause.category = category
    if (priority) whereClause.priority = priority
    if (type) whereClause.type = type
    if (active !== undefined) whereClause.isActive = active === 'true'

    const tasks = await OnboardingTask.findAll({
      where: whereClause,
      include: [{
        model: UserTask,
        as: 'userTasks',
        attributes: ['status'],
        required: false
      }],
      order: [['priority', 'DESC'], ['order', 'ASC']]
    })

    const tasksWithStats = tasks.map(task => {
      const userTasks = task.userTasks || []
      const completedCount = userTasks.filter(ut => ut.status === 'completed').length
      const totalAssigned = userTasks.length

      return {
        ...task.toJSON(),
        stats: {
          totalAssigned,
          completedCount,
          completionRate: totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0
        }
      }
    })

    res.json(tasksWithStats)
  } catch (error) {
    console.error('Get all tasks error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update onboarding task (HR Admin only)
router.put('/tasks/:taskId', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const task = await OnboardingTask.findByPk(req.params.taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const {
      title,
      description,
      type,
      category,
      priority,
      estimatedDuration,
      requiredRole,
      requiredDepartment,
      prerequisites,
      content,
      resources,
      isActive
    } = req.body

    await task.update({
      title: title || task.title,
      description: description || task.description,
      type: type || task.type,
      category: category || task.category,
      priority: priority || task.priority,
      estimatedDuration: estimatedDuration || task.estimatedDuration,
      requiredRole,
      requiredDepartment,
      prerequisites: prerequisites || task.prerequisites,
      content: content || task.content,
      resources: resources || task.resources,
      isActive: isActive !== undefined ? isActive : task.isActive
    })

    res.json({
      message: 'Task updated successfully',
      task: task.toJSON()
    })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete onboarding task (HR Admin only)
router.delete('/tasks/:taskId', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const task = await OnboardingTask.findByPk(req.params.taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Soft delete by setting isActive to false
    await task.update({ isActive: false })

    res.json({ message: 'Task deactivated successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get specific task details
router.get('/tasks/:taskId', authenticate, async (req, res) => {
  try {
    const userTask = await UserTask.findOne({
      where: {
        id: req.params.taskId,
        userId: req.user.id
      },
      include: [{
        model: OnboardingTask,
        as: 'task'
      }]
    })

    if (!userTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const taskDetails = {
      id: userTask.id,
      taskId: userTask.taskId,
      title: userTask.task.title,
      description: userTask.task.description,
      type: userTask.task.type,
      category: userTask.task.category,
      priority: userTask.task.priority,
      estimatedDuration: userTask.task.estimatedDuration,
      status: userTask.status,
      progress: userTask.progress,
      startedAt: userTask.startedAt,
      completedAt: userTask.completedAt,
      timeSpent: userTask.timeSpent,
      dueDate: userTask.dueDate,
      feedback: userTask.feedback,
      rating: userTask.rating,
      notes: userTask.notes,
      content: userTask.task.content,
      resources: userTask.task.resources,
      prerequisites: userTask.task.prerequisites
    }

    res.json(taskDetails)
  } catch (error) {
    console.error('Get task details error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update task progress
router.put('/tasks/:taskId', authenticate, validateRequest(schemas.updateTaskProgress), async (req, res) => {
  try {
    const { status, progress, feedback, rating, notes } = req.body

    const userTask = await UserTask.findOne({
      where: {
        id: req.params.taskId,
        userId: req.user.id
      }
    })

    if (!userTask) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const updateData = {}
    
    if (status) {
      updateData.status = status
      if (status === 'in_progress' && !userTask.startedAt) {
        updateData.startedAt = new Date()
      }
      if (status === 'completed') {
        updateData.completedAt = new Date()
        updateData.progress = 100
      }
    }
    
    if (progress !== undefined) updateData.progress = progress
    if (feedback) updateData.feedback = feedback
    if (rating) updateData.rating = rating
    if (notes) updateData.notes = notes

    await userTask.update(updateData)

    // Update user's overall progress
    await updateUserProgress(req.user.id)

    res.json({
      message: 'Task updated successfully',
      task: await UserTask.findByPk(userTask.id, {
        include: [{
          model: OnboardingTask,
          as: 'task'
        }]
      })
    })
  } catch (error) {
    console.error('Update task progress error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get personalized recommendations
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const recommendations = await recommendationService.getPersonalizedRecommendations(req.user.id)
    res.json(recommendations)
  } catch (error) {
    console.error('Get recommendations error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Track recommendation interaction
router.post('/recommendations/:taskId/interact', authenticate, async (req, res) => {
  try {
    const { action } = req.body // 'viewed', 'started', 'dismissed'
    
    await recommendationService.trackRecommendationInteraction(
      req.user.id,
      req.params.taskId,
      action
    )

    res.json({ message: 'Interaction tracked successfully' })
  } catch (error) {
    console.error('Track recommendation interaction error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Assign task to user (HR Admin only)
router.post('/assign', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { userId, taskId, dueDate } = req.body

    // Check if task is already assigned
    const existingAssignment = await UserTask.findOne({
      where: { userId, taskId }
    })

    if (existingAssignment) {
      return res.status(400).json({ error: 'Task already assigned to user' })
    }

    // Verify task exists
    const task = await OnboardingTask.findByPk(taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Create assignment
    const userTask = await UserTask.create({
      userId,
      taskId,
      dueDate: dueDate ? new Date(dueDate) : null
    })

    res.status(201).json({
      message: 'Task assigned successfully',
      assignment: userTask
    })
  } catch (error) {
    console.error('Assign task error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to update user's overall progress
async function updateUserProgress(userId) {
  try {
    const userTasks = await UserTask.findAll({
      where: { userId }
    })

    if (userTasks.length === 0) return

    const completedTasks = userTasks.filter(task => task.status === 'completed').length
    const progressPercentage = Math.round((completedTasks / userTasks.length) * 100)

    await User.update(
      { onboardingProgress: progressPercentage },
      { where: { id: userId } }
    )
  } catch (error) {
    console.error('Update user progress error:', error)
  }
}

export default router
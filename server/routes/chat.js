import express from 'express'
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest, schemas } from '../middleware/validation.js'
import { chatLimiter } from '../middleware/rateLimiter.js'
import aiService from '../services/aiService.js'
import { ChatMessage } from '../models/index.js'

const router = express.Router()

// Send message to AI
router.post('/message', authenticate, chatLimiter, validateRequest(schemas.chatMessage), async (req, res) => {
  try {
    const { message, context } = req.body

    const response = await aiService.processMessage(message, req.user.id, context)

    res.json({
      message: 'Message processed successfully',
      response: response.response,
      intent: response.intent,
      confidence: response.confidence,
      suggestions: response.suggestions,
      sentiment: response.sentiment
    })
  } catch (error) {
    console.error('Chat message error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get chat history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    const { count, rows: messages } = await ChatMessage.findAndCountAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalMessages: count,
        hasNext: offset + limit < count,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Get chat history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Provide feedback on AI response
router.post('/feedback/:messageId', authenticate, async (req, res) => {
  try {
    const { feedback } = req.body // 'helpful' or 'not_helpful'
    
    if (!['helpful', 'not_helpful'].includes(feedback)) {
      return res.status(400).json({ error: 'Invalid feedback value' })
    }

    const message = await ChatMessage.findOne({
      where: {
        id: req.params.messageId,
        userId: req.user.id
      }
    })

    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }

    await message.update({ feedback })

    res.json({ message: 'Feedback recorded successfully' })
  } catch (error) {
    console.error('Chat feedback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get chat analytics (HR Admin only)
router.get('/analytics', authenticate, authorize('hr_admin'), async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query
    
    const analytics = await aiService.getAnalytics(timeframe)
    
    res.json(analytics)
  } catch (error) {
    console.error('Chat analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Clear chat history
router.delete('/history', authenticate, async (req, res) => {
  try {
    await ChatMessage.destroy({
      where: { userId: req.user.id }
    })

    res.json({ message: 'Chat history cleared successfully' })
  } catch (error) {
    console.error('Clear chat history error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
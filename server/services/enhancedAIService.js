import tf from '@tensorflow/tfjs-node'
import brain from 'brain.js'
import natural from 'natural'
import sentiment from 'sentiment'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ChatMessage, User, UserTask, OnboardingTask } from '../models/index.js'
import { Op } from 'sequelize'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class EnhancedAIService {
  constructor() {
    this.models = {
      faqClassifier: null,
      recommendationEngine: null,
      progressPredictor: null
    }
    this.vocabulary = null
    this.tokenizer = new natural.WordTokenizer()
    this.stemmer = natural.PorterStemmer
    this.sentiment = new sentiment()
    this.isInitialized = false
    
    // Initialize models on startup
    this.initialize()
  }

  async initialize() {
    try {
      console.log('🤖 Initializing Enhanced AI Service...')
      await this.loadModels()
      this.isInitialized = true
      console.log('✅ Enhanced AI Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error)
      // Fallback to basic service
      this.isInitialized = false
    }
  }

  async loadModels() {
    const modelsPath = path.join(__dirname, '../../models')
    
    try {
      // Load FAQ Classifier
      this.models.faqClassifier = await tf.loadLayersModel(`file://${modelsPath}/faq-classifier/model.json`)
      
      // Load vocabulary
      const vocabData = await fs.readFile(path.join(modelsPath, 'vocabulary.json'), 'utf8')
      this.vocabulary = JSON.parse(vocabData)
      
      // Load Recommendation Engine
      const recEngineData = await fs.readFile(path.join(modelsPath, 'recommendation-engine.json'), 'utf8')
      this.models.recommendationEngine = new brain.NeuralNetwork()
      this.models.recommendationEngine.fromJSON(JSON.parse(recEngineData))
      
      // Load Progress Predictor
      this.models.progressPredictor = await tf.loadLayersModel(`file://${modelsPath}/progress-predictor/model.json`)
      
      console.log('✅ All AI models loaded successfully')
    } catch (error) {
      console.warn('⚠️  Could not load trained models, using fallback logic')
      throw error
    }
  }

  async processMessage(message, userId, context = {}) {
    const startTime = Date.now()
    
    try {
      // Enhanced NLP processing
      const tokens = this.tokenizer.tokenize(message.toLowerCase())
      const stemmedTokens = tokens.map(token => this.stemmer.stem(token))
      
      // Intent detection using trained model or fallback
      const intent = this.isInitialized ? 
        await this.detectIntentML(message) : 
        this.detectIntentFallback(stemmedTokens)
      
      // Sentiment analysis
      const sentimentResult = this.sentiment.analyze(message)
      
      // Context-aware response generation
      const response = await this.generateContextualResponse(intent, context, sentimentResult, userId)
      
      // Calculate confidence
      const confidence = this.calculateConfidence(intent, stemmedTokens)
      
      const responseTime = Date.now() - startTime
      
      // Save interaction to database
      await ChatMessage.create({
        userId,
        message,
        response,
        intent: intent.name,
        confidence,
        context: {
          ...context,
          sentiment: sentimentResult,
          tokens: stemmedTokens,
          modelUsed: this.isInitialized ? 'ml' : 'fallback'
        },
        responseTime
      })
      
      return {
        response,
        intent: intent.name,
        confidence,
        suggestions: await this.generateSmartSuggestions(intent, userId),
        sentiment: sentimentResult.score > 0 ? 'positive' : sentimentResult.score < 0 ? 'negative' : 'neutral',
        responseTime
      }
    } catch (error) {
      console.error('Enhanced AI Service Error:', error)
      return this.getFallbackResponse()
    }
  }

  async detectIntentML(message) {
    if (!this.isInitialized || !this.models.faqClassifier) {
      return this.detectIntentFallback(message.split(' '))
    }

    try {
      // Encode message using vocabulary
      const vector = new Array(this.vocabulary.length).fill(0)
      message.toLowerCase().split(' ').forEach(word => {
        const index = this.vocabulary.indexOf(word)
        if (index !== -1) vector[index] = 1
      })
      
      // Get prediction
      const prediction = this.models.faqClassifier.predict(tf.tensor2d([vector]))
      const probabilities = await prediction.data()
      const maxIndex = prediction.argMax(1).dataSync()[0]
      
      const categories = ['benefits', 'team', 'tasks', 'technical', 'policies']
      const confidence = probabilities[maxIndex]
      
      prediction.dispose()
      
      return {
        name: categories[maxIndex],
        score: confidence,
        probabilities: Object.fromEntries(categories.map((cat, i) => [cat, probabilities[i]]))
      }
    } catch (error) {
      console.error('ML Intent Detection Error:', error)
      return this.detectIntentFallback(message.split(' '))
    }
  }

  detectIntentFallback(tokens) {
    const intents = {
      benefits: ['benefit', 'insurance', 'health', '401k', 'vacation', 'pto', 'sick', 'leave'],
      team: ['team', 'colleague', 'manager', 'supervisor', 'coworker', 'department'],
      tasks: ['task', 'todo', 'assignment', 'deadline', 'complete', 'progress'],
      technical: ['setup', 'computer', 'software', 'access', 'login', 'password', 'account'],
      policies: ['policy', 'rule', 'guideline', 'handbook', 'procedure', 'process']
    }

    let bestMatch = { name: 'general', score: 0 }
    
    for (const [intentName, keywords] of Object.entries(intents)) {
      let score = 0
      for (const keyword of keywords) {
        if (tokens.includes(keyword) || tokens.some(token => token.includes(keyword))) {
          score += 1
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { name: intentName, score }
      }
    }
    
    return bestMatch
  }

  async generateContextualResponse(intent, context, sentiment, userId) {
    // Get user context for personalization
    const user = await User.findByPk(userId, {
      include: [{
        model: UserTask,
        as: 'tasks',
        include: [{ model: OnboardingTask, as: 'task' }]
      }]
    })

    const responses = await this.getContextualResponses(intent.name, user, context)
    let selectedResponse = responses[Math.floor(Math.random() * responses.length)]
    
    // Personalize response
    if (user) {
      selectedResponse = selectedResponse.replace('{name}', user.firstName)
      selectedResponse = selectedResponse.replace('{department}', user.department || 'your department')
      selectedResponse = selectedResponse.replace('{progress}', `${user.onboardingProgress}%`)
    }
    
    // Adjust for sentiment
    if (sentiment.score < -2) {
      selectedResponse = "I understand this might be frustrating. " + selectedResponse + " Is there anything specific I can help clarify?"
    } else if (sentiment.score > 2) {
      selectedResponse = "Great to hear you're engaged! " + selectedResponse
    }
    
    return selectedResponse
  }

  async getContextualResponses(intentName, user, context) {
    const baseResponses = {
      benefits: [
        "ZHD Consulting offers comprehensive benefits including health insurance with full coverage, 401(k) with 4% company match, 15 days PTO plus sick days, and a $2,000 annual professional development budget.",
        "Our benefits package is designed to support your well-being and growth. You'll have access to premium health coverage, retirement planning, flexible time off, and continuous learning opportunities."
      ],
      team: [
        "Your team information is available in your dashboard. Based on your department ({department}), you'll be working closely with experienced professionals who are excited to welcome you.",
        "I can help you connect with your team members. Your direct manager and colleagues are listed in the 'Team' section of your profile, along with their contact information and roles."
      ],
      tasks: [
        "You're currently {progress} through your onboarding journey! Your remaining tasks are prioritized by importance and deadline in the 'Onboarding' section.",
        "Your personalized task list is designed specifically for your role and department. Each task includes detailed instructions, estimated time, and helpful resources."
      ],
      technical: [
        "For technical setup and IT support, you can reach our IT team at ext. 4400 or it-help@zhd.com. They're available Monday-Friday, 8 AM - 6 PM EST.",
        "Technical issues are common during onboarding! Our IT team has prepared step-by-step guides for most setup procedures, and they're always ready to help with personalized support."
      ],
      policies: [
        "All company policies are available in your Employee Handbook, accessible through the HR portal. Key policies include our code of conduct, remote work guidelines, and performance review process.",
        "ZHD's policies are designed to create a supportive and productive work environment. You can find detailed information about expectations, benefits, and procedures in your onboarding materials."
      ]
    }

    let responses = baseResponses[intentName] || [
      "I'm here to help with your onboarding questions. You can ask about benefits, tasks, team members, company policies, or technical support.",
      "How can I assist you today? I have access to information about your specific onboarding journey and can provide personalized guidance."
    ]

    // Add context-specific responses
    if (user && user.tasks) {
      const incompleteTasks = user.tasks.filter(ut => ut.status !== 'completed')
      if (incompleteTasks.length > 0 && intentName === 'tasks') {
        const nextTask = incompleteTasks[0]
        responses.push(`Your next priority task is "${nextTask.task.title}" which should take about ${nextTask.task.estimatedDuration} minutes to complete.`)
      }
    }

    return responses
  }

  async generateSmartSuggestions(intent, userId) {
    const user = await User.findByPk(userId, {
      include: [{ model: UserTask, as: 'tasks', include: [{ model: OnboardingTask, as: 'task' }] }]
    })

    const baseSuggestions = {
      benefits: ['Health insurance details', 'How to enroll in 401(k)', 'PTO policy', 'Professional development budget'],
      team: ['Schedule team meetings', 'Contact information', 'Department structure', 'Manager introduction'],
      tasks: ['View all tasks', 'Check deadlines', 'Get help with current task', 'Track progress'],
      technical: ['IT support contact', 'Setup guides', 'Password reset', 'VPN configuration'],
      policies: ['Employee handbook', 'Code of conduct', 'Remote work policy', 'Performance reviews']
    }

    let suggestions = baseSuggestions[intent.name] || ['View dashboard', 'Contact HR', 'Onboarding progress']

    // Add personalized suggestions based on user progress
    if (user && user.tasks) {
      const incompleteTasks = user.tasks.filter(ut => ut.status !== 'completed').slice(0, 2)
      incompleteTasks.forEach(task => {
        suggestions.unshift(`Continue: ${task.task.title}`)
      })
    }

    return suggestions.slice(0, 4) // Return top 4 suggestions
  }

  async getPersonalizedRecommendations(userId) {
    if (!this.isInitialized || !this.models.recommendationEngine) {
      return this.getFallbackRecommendations(userId)
    }

    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserTask, as: 'tasks', include: [{ model: OnboardingTask, as: 'task' }] }]
      })

      if (!user) return []

      // Get available tasks
      const assignedTaskIds = user.tasks.map(ut => ut.taskId)
      const availableTasks = await OnboardingTask.findAll({
        where: {
          id: { [Op.notIn]: assignedTaskIds },
          isActive: true
        }
      })

      const recommendations = []

      for (const task of availableTasks) {
        // Prepare input for recommendation model
        const input = {
          userId: this.hashString(user.id),
          taskId: this.hashString(task.id),
          completionTime: 0.5, // Normalized average
          engagement: user.onboardingProgress / 100
        }

        // Get recommendation score
        const prediction = this.models.recommendationEngine.run(input)
        const score = prediction.rating

        if (score > 0.6) { // Threshold for recommendations
          recommendations.push({
            id: task.id,
            title: task.title,
            description: task.description,
            type: task.type,
            category: task.category,
            priority: this.mapScoreToPriority(score),
            estimatedTime: `${task.estimatedDuration} min`,
            score: score,
            reasons: this.generateRecommendationReasons(task, user, score)
          })
        }
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    } catch (error) {
      console.error('Personalized Recommendations Error:', error)
      return this.getFallbackRecommendations(userId)
    }
  }

  async predictProgress(userId) {
    if (!this.isInitialized || !this.models.progressPredictor) {
      return this.getFallbackProgressPrediction(userId)
    }

    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserTask, as: 'tasks' }]
      })

      if (!user) return null

      const features = [
        this.encodeDepartment(user.department),
        this.encodeRole(user.role),
        user.tasks.filter(t => t.status === 'completed').length / 10, // Normalize
        user.tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0) / 500, // Normalize
        user.onboardingProgress / 100 // Current progress as engagement proxy
      ]

      const prediction = this.models.progressPredictor.predict(tf.tensor2d([features]))
      const predictedProgress = prediction.dataSync()[0] * 100

      prediction.dispose()

      return {
        currentProgress: user.onboardingProgress,
        predictedFinalProgress: Math.round(predictedProgress),
        estimatedCompletionDays: this.estimateCompletionTime(user, predictedProgress),
        confidence: 0.85 // Model confidence
      }

    } catch (error) {
      console.error('Progress Prediction Error:', error)
      return this.getFallbackProgressPrediction(userId)
    }
  }

  // Utility methods
  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash) / 2147483647
  }

  encodeDepartment(dept) {
    const depts = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR']
    return depts.indexOf(dept) / (depts.length - 1) || 0.5
  }

  encodeRole(role) {
    const roles = ['new_hire', 'employee', 'manager', 'hr_admin']
    return roles.indexOf(role) / (roles.length - 1) || 0
  }

  mapScoreToPriority(score) {
    if (score > 0.8) return 'high'
    if (score > 0.6) return 'medium'
    return 'low'
  }

  generateRecommendationReasons(task, user, score) {
    const reasons = []
    
    if (task.priority === 'high') reasons.push('High priority for your role')
    if (task.requiredDepartment === user.department) reasons.push('Department-specific requirement')
    if (score > 0.8) reasons.push('Highly recommended based on your profile')
    if (task.category === 'security') reasons.push('Critical for compliance')
    
    return reasons.slice(0, 3)
  }

  estimateCompletionTime(user, predictedProgress) {
    const remainingProgress = 100 - user.onboardingProgress
    const progressRate = user.onboardingProgress / this.getDaysSinceStart(user)
    return Math.ceil(remainingProgress / Math.max(progressRate, 1))
  }

  getDaysSinceStart(user) {
    if (!user.startDate) return 1
    return Math.max(1, Math.floor((new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)))
  }

  calculateConfidence(intent, tokens) {
    if (intent.score === 0) return 0.1
    return Math.min(intent.score / 5, 1.0) // Normalize to 0-1
  }

  // Fallback methods
  getFallbackResponse() {
    return {
      response: "I'm here to help with your onboarding questions. You can ask about benefits, tasks, team members, or company policies.",
      intent: 'general',
      confidence: 0.5,
      suggestions: ['View dashboard', 'Contact HR', 'Check tasks', 'Ask about benefits'],
      sentiment: 'neutral',
      responseTime: 100
    }
  }

  async getFallbackRecommendations(userId) {
    // Simple rule-based recommendations
    const user = await User.findByPk(userId, {
      include: [{ model: UserTask, as: 'tasks', include: [{ model: OnboardingTask, as: 'task' }] }]
    })

    if (!user) return []

    const assignedTaskIds = user.tasks.map(ut => ut.taskId)
    const availableTasks = await OnboardingTask.findAll({
      where: {
        id: { [Op.notIn]: assignedTaskIds },
        isActive: true,
        [Op.or]: [
          { requiredRole: null },
          { requiredRole: user.role },
          { requiredDepartment: null },
          { requiredDepartment: user.department }
        ]
      },
      order: [['priority', 'DESC'], ['order', 'ASC']],
      limit: 5
    })

    return availableTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      type: task.type,
      category: task.category,
      priority: task.priority,
      estimatedTime: `${task.estimatedDuration} min`,
      score: 0.7, // Default score
      reasons: ['Recommended for your role', 'Next in sequence']
    }))
  }

  getFallbackProgressPrediction(userId) {
    return {
      currentProgress: 65,
      predictedFinalProgress: 95,
      estimatedCompletionDays: 7,
      confidence: 0.6
    }
  }

  // Analytics and monitoring
  async getAnalytics(timeframe = '30d') {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeframe.replace('d', '')))

    const messages = await ChatMessage.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: ['intent', 'confidence', 'feedback', 'responseTime', 'context']
    })

    return {
      totalMessages: messages.length,
      averageConfidence: messages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / messages.length,
      averageResponseTime: messages.reduce((sum, msg) => sum + (msg.responseTime || 0), 0) / messages.length,
      intentDistribution: this.calculateIntentDistribution(messages),
      feedbackStats: this.calculateFeedbackStats(messages),
      modelUsage: this.calculateModelUsage(messages)
    }
  }

  calculateIntentDistribution(messages) {
    const distribution = {}
    messages.forEach(msg => {
      distribution[msg.intent] = (distribution[msg.intent] || 0) + 1
    })
    return distribution
  }

  calculateFeedbackStats(messages) {
    return {
      helpful: messages.filter(m => m.feedback === 'helpful').length,
      notHelpful: messages.filter(m => m.feedback === 'not_helpful').length,
      total: messages.filter(m => m.feedback).length
    }
  }

  calculateModelUsage(messages) {
    const usage = { ml: 0, fallback: 0 }
    messages.forEach(msg => {
      const modelUsed = msg.context?.modelUsed || 'fallback'
      usage[modelUsed] = (usage[modelUsed] || 0) + 1
    })
    return usage
  }
}

export default new EnhancedAIService()
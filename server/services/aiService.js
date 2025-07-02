import natural from 'natural'
import sentiment from 'sentiment'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { ChatMessage } from '../models/index.js'
import { Op } from 'sequelize'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class AIService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer()
    this.stemmer = natural.PorterStemmer
    this.sentiment = new sentiment()
    this.classifier = null
    this.vocabulary = null
    this.recommendationEngine = null
    this.progressPredictor = null
    this.isInitialized = false
    
    this.initialize()
  }

  async initialize() {
    try {
      console.log('🤖 Initializing AI Service...')
      await this.loadModels()
      this.isInitialized = true
      console.log('✅ AI Service initialized successfully')
    } catch (error) {
      console.warn('⚠️  Could not load trained models, using fallback logic:', error.message)
      this.isInitialized = false
    }
  }

  async loadModels() {
    const modelsPath = path.join(__dirname, '../../models')
    
    try {
      // Load FAQ Classifier
      const classifierData = await fs.readFile(path.join(modelsPath, 'faq-classifier.json'), 'utf8')
      this.classifier = natural.BayesClassifier.restore(JSON.parse(classifierData))
      
      // Load vocabulary
      const vocabData = await fs.readFile(path.join(modelsPath, 'vocabulary.json'), 'utf8')
      this.vocabulary = JSON.parse(vocabData)
      
      // Load Recommendation Engine
      const recEngineData = await fs.readFile(path.join(modelsPath, 'recommendation-engine.json'), 'utf8')
      this.recommendationEngine = JSON.parse(recEngineData)
      
      // Load Progress Predictor
      const progressData = await fs.readFile(path.join(modelsPath, 'progress-predictor.json'), 'utf8')
      this.progressPredictor = JSON.parse(progressData)
      
      console.log('✅ All AI models loaded successfully')
    } catch (error) {
      console.warn('⚠️  Could not load trained models, using fallback logic')
      throw error
    }
  }

  async processMessage(message, userId, context = {}) {
    const startTime = Date.now()
    
    try {
      // Tokenize and stem the message
      const tokens = this.tokenizer.tokenize(message.toLowerCase())
      const stemmedTokens = tokens.map(token => this.stemmer.stem(token))
      
      // Detect intent using trained model or fallback
      const intent = this.isInitialized ? 
        this.detectIntentML(message) : 
        this.detectIntentFallback(stemmedTokens)
      
      // Analyze sentiment
      const sentimentResult = this.sentiment.analyze(message)
      
      // Generate response
      const response = this.generateResponse(intent, context, sentimentResult)
      
      // Calculate confidence
      const confidence = this.calculateConfidence(intent, stemmedTokens)
      
      const responseTime = Date.now() - startTime
      
      // Save to database
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
          modelUsed: this.isInitialized ? 'trained' : 'fallback'
        },
        responseTime
      })
      
      return {
        response,
        intent: intent.name,
        confidence,
        suggestions: this.generateSuggestions(intent),
        sentiment: sentimentResult.score > 0 ? 'positive' : sentimentResult.score < 0 ? 'negative' : 'neutral'
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support.",
        intent: 'error',
        confidence: 0,
        suggestions: ['Contact HR', 'Try again later', 'Check documentation']
      }
    }
  }

  detectIntentML(message) {
    if (!this.isInitialized || !this.classifier) {
      return this.detectIntentFallback(message.split(' '))
    }

    try {
      const classification = this.classifier.classify(message)
      const classifications = this.classifier.getClassifications(message)
      
      const topClassification = classifications[0]
      
      return {
        name: classification,
        score: topClassification.value,
        confidence: topClassification.value
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

  generateResponse(intent, context, sentiment) {
    const responses = {
      benefits: [
        "ZHD Consulting offers comprehensive benefits including health insurance, 401(k) with company match, PTO, and professional development opportunities.",
        "Our benefits package includes full health coverage, dental, vision, 15 days PTO, and $2,000 annual learning budget."
      ],
      team: [
        "Your team information is available in your dashboard. You can also schedule 1-on-1 meetings with team members through the platform.",
        "I can help you connect with your team members. Check the 'Team' section in your profile for contact details."
      ],
      tasks: [
        "You can view all your onboarding tasks in the 'Onboarding' section. Tasks are prioritized by importance and deadline.",
        "Your current tasks are displayed on your dashboard. Click on any task for detailed instructions and resources."
      ],
      technical: [
        "For technical setup, please refer to the IT Setup guide in your tasks or contact IT support at ext. 4400.",
        "Technical issues can be resolved by following the setup guide or reaching out to our IT team."
      ],
      policies: [
        "Company policies are available in the Employee Handbook section. You can also find specific policies in your onboarding tasks.",
        "All policies and procedures are documented in your onboarding materials. Check the HR Policies task for details."
      ],
      general: [
        "I'm here to help with your onboarding questions. You can ask about benefits, tasks, team members, or company policies.",
        "How can I assist you today? I can help with onboarding tasks, company information, or connect you with the right people."
      ]
    }

    const intentResponses = responses[intent.name] || responses.general
    let selectedResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)]
    
    // Adjust response based on sentiment
    if (sentiment.score < -2) {
      selectedResponse = "I understand this might be frustrating. " + selectedResponse + " Is there anything specific I can help clarify?"
    } else if (sentiment.score > 2) {
      selectedResponse = "Great to hear you're engaged! " + selectedResponse
    }
    
    return selectedResponse
  }

  calculateConfidence(intent, tokens) {
    if (intent.score === 0) return 0.1
    
    // For ML models, use the model's confidence
    if (this.isInitialized && intent.confidence) {
      return intent.confidence
    }
    
    // For fallback, calculate based on keyword matches
    const maxPossibleScore = 5 // Reasonable maximum for keyword matching
    return Math.min(intent.score / maxPossibleScore, 1.0)
  }

  generateSuggestions(intent) {
    const suggestions = {
      benefits: ['Health insurance details', 'How to enroll in 401(k)', 'PTO policy'],
      team: ['Schedule team meetings', 'Contact information', 'Department structure'],
      tasks: ['View all tasks', 'Check deadlines', 'Get help with current task'],
      technical: ['IT support contact', 'Setup guides', 'Password reset'],
      policies: ['Employee handbook', 'Code of conduct', 'Remote work policy'],
      general: ['View dashboard', 'Contact HR', 'Onboarding progress']
    }
    
    return suggestions[intent.name] || suggestions.general
  }

  async getAnalytics(timeframe = '30d') {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeframe.replace('d', '')))
    
    const messages = await ChatMessage.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: ['intent', 'confidence', 'feedback', 'responseTime', 'context']
    })
    
    const analytics = {
      totalMessages: messages.length,
      averageConfidence: messages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / messages.length,
      averageResponseTime: messages.reduce((sum, msg) => sum + (msg.responseTime || 0), 0) / messages.length,
      intentDistribution: {},
      feedbackStats: {
        helpful: messages.filter(m => m.feedback === 'helpful').length,
        notHelpful: messages.filter(m => m.feedback === 'not_helpful').length
      },
      modelUsage: {
        trained: messages.filter(m => m.context?.modelUsed === 'trained').length,
        fallback: messages.filter(m => m.context?.modelUsed === 'fallback').length
      }
    }
    
    // Calculate intent distribution
    messages.forEach(msg => {
      analytics.intentDistribution[msg.intent] = (analytics.intentDistribution[msg.intent] || 0) + 1
    })
    
    return analytics
  }

  // Recommendation methods using the trained model
  async getPersonalizedRecommendations(userId) {
    if (!this.isInitialized || !this.recommendationEngine) {
      return this.getFallbackRecommendations()
    }

    try {
      // Use the collaborative filtering model
      const recommendations = []
      const engine = this.recommendationEngine
      
      // Get predictions for unrated items
      for (const item of engine.items) {
        if (!engine.userItemMatrix[userId] || engine.userItemMatrix[userId][item] === 0) {
          const prediction = engine.predict(userId, item)
          if (prediction > 3.5) { // Threshold for recommendations
            recommendations.push({
              id: item,
              title: this.getTaskTitle(item),
              score: prediction,
              type: 'collaborative'
            })
          }
        }
      }

      return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
    } catch (error) {
      console.error('Recommendation Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  getFallbackRecommendations() {
    return [
      {
        id: 'security-training',
        title: 'IT Security Training',
        score: 0.8,
        type: 'fallback'
      },
      {
        id: 'team-intro',
        title: 'Team Introduction',
        score: 0.7,
        type: 'fallback'
      }
    ]
  }

  getTaskTitle(taskId) {
    const taskTitles = {
      'security-training': 'IT Security Training',
      'team-intro': 'Team Introduction',
      'tech-setup': 'Technical Setup',
      'hr-policies': 'HR Policies',
      'first-project': 'First Project'
    }
    return taskTitles[taskId] || taskId
  }

  // Progress prediction using the trained model
  async predictProgress(userId, features) {
    if (!this.isInitialized || !this.progressPredictor) {
      return this.getFallbackProgressPrediction()
    }

    try {
      const prediction = this.progressPredictor.predict(features)
      return {
        predictedProgress: Math.max(0, Math.min(100, prediction * 100)),
        confidence: 0.78,
        model: 'linear_regression'
      }
    } catch (error) {
      console.error('Progress Prediction Error:', error)
      return this.getFallbackProgressPrediction()
    }
  }

  getFallbackProgressPrediction() {
    return {
      predictedProgress: 75,
      confidence: 0.6,
      model: 'fallback'
    }
  }
}

export default new AIService()
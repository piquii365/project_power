import natural from 'natural'
import sentiment from 'sentiment'
import { ChatMessage } from '../models/index.js'

class AIService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer()
    this.stemmer = natural.PorterStemmer
    this.sentiment = new sentiment()
    this.intents = this.loadIntents()
  }

  loadIntents() {
    return {
      benefits: {
        keywords: ['benefit', 'insurance', 'health', '401k', 'vacation', 'pto', 'sick', 'leave'],
        responses: [
          "ZHD Consulting offers comprehensive benefits including health insurance, 401(k) with company match, PTO, and professional development opportunities.",
          "Our benefits package includes full health coverage, dental, vision, 15 days PTO, and $2,000 annual learning budget."
        ]
      },
      team: {
        keywords: ['team', 'colleague', 'manager', 'supervisor', 'coworker', 'department'],
        responses: [
          "Your team information is available in your dashboard. You can also schedule 1-on-1 meetings with team members through the platform.",
          "I can help you connect with your team members. Check the 'Team' section in your profile for contact details."
        ]
      },
      tasks: {
        keywords: ['task', 'todo', 'assignment', 'deadline', 'complete', 'progress'],
        responses: [
          "You can view all your onboarding tasks in the 'Onboarding' section. Tasks are prioritized by importance and deadline.",
          "Your current tasks are displayed on your dashboard. Click on any task for detailed instructions and resources."
        ]
      },
      technical: {
        keywords: ['setup', 'computer', 'software', 'access', 'login', 'password', 'account'],
        responses: [
          "For technical setup, please refer to the IT Setup guide in your tasks or contact IT support at ext. 4400.",
          "Technical issues can be resolved by following the setup guide or reaching out to our IT team."
        ]
      },
      policies: {
        keywords: ['policy', 'rule', 'guideline', 'handbook', 'procedure', 'process'],
        responses: [
          "Company policies are available in the Employee Handbook section. You can also find specific policies in your onboarding tasks.",
          "All policies and procedures are documented in your onboarding materials. Check the HR Policies task for details."
        ]
      },
      general: {
        keywords: ['help', 'question', 'support', 'assistance'],
        responses: [
          "I'm here to help with your onboarding questions. You can ask about benefits, tasks, team members, or company policies.",
          "How can I assist you today? I can help with onboarding tasks, company information, or connect you with the right people."
        ]
      }
    }
  }

  async processMessage(message, userId, context = {}) {
    const startTime = Date.now()
    
    try {
      // Tokenize and stem the message
      const tokens = this.tokenizer.tokenize(message.toLowerCase())
      const stemmedTokens = tokens.map(token => this.stemmer.stem(token))
      
      // Detect intent
      const intent = this.detectIntent(stemmedTokens)
      
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
          tokens: stemmedTokens
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

  detectIntent(tokens) {
    let bestMatch = { name: 'general', score: 0 }
    
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      let score = 0
      for (const keyword of intentData.keywords) {
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
    const intentData = this.intents[intent.name] || this.intents.general
    const responses = intentData.responses
    
    // Select response based on context or randomly
    let selectedResponse = responses[Math.floor(Math.random() * responses.length)]
    
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
    
    const maxPossibleScore = Math.max(...Object.values(this.intents).map(i => i.keywords.length))
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
      attributes: ['intent', 'confidence', 'feedback', 'responseTime']
    })
    
    const analytics = {
      totalMessages: messages.length,
      averageConfidence: messages.reduce((sum, msg) => sum + (msg.confidence || 0), 0) / messages.length,
      averageResponseTime: messages.reduce((sum, msg) => sum + (msg.responseTime || 0), 0) / messages.length,
      intentDistribution: {},
      feedbackStats: {
        helpful: messages.filter(m => m.feedback === 'helpful').length,
        notHelpful: messages.filter(m => m.feedback === 'not_helpful').length
      }
    }
    
    // Calculate intent distribution
    messages.forEach(msg => {
      analytics.intentDistribution[msg.intent] = (analytics.intentDistribution[msg.intent] || 0) + 1
    })
    
    return analytics
  }
}

export default new AIService()
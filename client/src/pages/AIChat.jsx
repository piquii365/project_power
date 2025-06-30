import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Lightbulb, Clock, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const AIChat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hi ${user?.name.split(' ')[0]}! I'm your AI onboarding assistant. I'm here to help you with any questions about ZHD Consulting, your role, benefits, or anything else you need to know. What would you like to learn about?`,
        timestamp: new Date(),
        suggestions: [
          'Tell me about company benefits',
          'What are my upcoming tasks?',
          'Who is on my team?',
          'How do I access company resources?'
        ]
      }
    ])
  }, [user])

  const handleSend = async (message = input) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateResponse(message)
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const generateResponse = (userMessage) => {
    const responses = {
      benefits: {
        content: `Great question! ZHD Consulting offers comprehensive benefits including:

• **Health Insurance**: Full coverage with dental and vision
• **401(k)**: 4% company match, immediate vesting
• **PTO**: 15 days vacation + 10 sick days + holidays
• **Professional Development**: $2,000 annual learning budget
• **Remote Work**: Flexible hybrid schedule
• **Wellness**: Gym membership reimbursement

Would you like more details about any specific benefit?`,
        suggestions: ['Health insurance details', 'How to enroll in 401(k)', 'Remote work policy']
      },
      team: {
        content: `You'll be working with an amazing team! Here's who you'll be collaborating with closely:

• **Sarah Chen** - Team Lead (sarah.chen@zhd.com)
• **Mike Rodriguez** - Senior Developer (mike.r@zhd.com)
• **Emily Watson** - UX Designer (emily.w@zhd.com)
• **James Liu** - Product Manager (james.liu@zhd.com)

Your direct manager is Sarah Chen. I'd recommend scheduling 1-on-1 meetings with each team member during your first week!`,
        suggestions: ['Schedule team meetings', 'Learn about current projects', 'Team communication tools']
      },
      tasks: {
        content: `Based on your progress, here are your upcoming priority tasks:

🔴 **High Priority**:
• Complete IT Security Training (Due: Jan 20)
• Technical Setup & Tools (Due: Jan 21)

🟡 **Medium Priority**:
• Team Introduction Meeting (Due: Jan 22)
• Review Project Documentation

🟢 **Low Priority**:
• First Project Assignment (Due: Jan 25)

Would you like help with any of these tasks?`,
        suggestions: ['Help with security training', 'Technical setup guide', 'Project details']
      },
      resources: {
        content: `Here are the key resources you'll need:

**Essential Tools**:
• **Slack**: Team communication (invite sent to your email)
• **Jira**: Project management (access being provisioned)
• **GitHub**: Code repository (pending approval)
• **Figma**: Design collaboration

**Company Resources**:
• **Employee Handbook**: Available on the intranet
• **IT Support**: ext. 4400 or it-help@zhd.com
• **HR Portal**: benefits.zhd.com

Need help accessing any of these?`,
        suggestions: ['Slack setup help', 'Password reset', 'IT support contact']
      },
      default: {
        content: `I understand you're asking about that. While I'm continuously learning, I might not have all the specific details you need right now. 

Here are some things I can definitely help you with:
• Company policies and benefits
• Onboarding tasks and deadlines  
• Team introductions and contacts
• Access to tools and resources
• General questions about ZHD Consulting

For more specific questions, I'd recommend reaching out to your manager Sarah Chen or HR directly. Is there something else I can help you with?`,
        suggestions: ['Contact HR', 'Message my manager', 'View company directory']
      }
    }

    let responseKey = 'default'
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('benefit') || lowerMessage.includes('insurance') || lowerMessage.includes('401k') || lowerMessage.includes('pto')) {
      responseKey = 'benefits'
    } else if (lowerMessage.includes('team') || lowerMessage.includes('colleague') || lowerMessage.includes('manager')) {
      responseKey = 'team'
    } else if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('upcoming') || lowerMessage.includes('deadline')) {
      responseKey = 'tasks'
    } else if (lowerMessage.includes('access') || lowerMessage.includes('tool') || lowerMessage.includes('login') || lowerMessage.includes('resource')) {
      responseKey = 'resources'
    }

    return {
      id: Date.now(),
      type: 'bot',
      content: responses[responseKey].content,
      timestamp: new Date(),
      suggestions: responses[responseKey].suggestions
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const Message = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-primary-500' 
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            {message.type === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
        
        <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-4 py-3 max-w-lg ${
            message.type === 'user'
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-white shadow-soft rounded-bl-md border border-gray-100'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {message.suggestions && (
            <div className="flex flex-wrap gap-2 mt-3 max-w-lg">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Onboarding Assistant</h1>
            <p className="text-sm text-gray-600">Get instant answers to your onboarding questions</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <AnimatePresence>
          {messages.map(message => (
            <Message key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-soft border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your onboarding..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="flex items-center justify-center w-12 h-12 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          AI responses are generated for demonstration purposes
        </div>
      </div>
    </motion.div>
  )
}

export default AIChat
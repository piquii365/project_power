import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Lightbulb, Clock, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { sendMessage, getChatHistory } from '../api'

const AIChat = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      const response = await getChatHistory(1, 50)
      if (response.messages && response.messages.length > 0) {
        const formattedMessages = response.messages.map(msg => ({
          id: msg.id,
          type: 'user',
          content: msg.message,
          timestamp: new Date(msg.createdAt)
        })).concat(response.messages.map(msg => ({
          id: `${msg.id}-response`,
          type: 'bot',
          content: msg.response,
          timestamp: new Date(msg.createdAt),
          intent: msg.intent,
          confidence: msg.confidence
        }))).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        
        setMessages(formattedMessages)
      } else {
        // Add welcome message if no history
        setMessages([
          {
            id: 1,
            type: 'bot',
            content: `Hi ${user?.firstName || 'there'}! I'm your AI onboarding assistant. I'm here to help you with any questions about ZHD Consulting, your role, benefits, or anything else you need to know. What would you like to learn about?`,
            timestamp: new Date(),
            suggestions: [
              'Tell me about company benefits',
              'What are my upcoming tasks?',
              'Who is on my team?',
              'How do I access company resources?'
            ]
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      // Add welcome message on error
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hi ${user?.firstName || 'there'}! I'm your AI onboarding assistant. How can I help you today?`,
          timestamp: new Date(),
          suggestions: [
            'Tell me about company benefits',
            'What are my upcoming tasks?',
            'Who is on my team?',
            'How do I access company resources?'
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

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

    try {
      const response = await sendMessage({ 
        message, 
        context: { 
          userId: user?.id,
          currentPage: 'chat'
        } 
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence,
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support.",
        timestamp: new Date(),
        suggestions: ['Try again', 'Contact HR', 'View help documentation']
      }
      setMessages(prev => [...prev, errorMessage])
      
      addNotification({
        type: 'error',
        title: 'Message Failed',
        message: 'Unable to send message. Please try again.'
      })
    } finally {
      setIsTyping(false)
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
            {message.confidence && (
              <div className="text-xs opacity-70 mt-1">
                Confidence: {Math.round(message.confidence * 100)}%
              </div>
            )}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

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
          AI responses are powered by advanced machine learning
        </div>
      </div>
    </motion.div>
  )
}

export default AIChat
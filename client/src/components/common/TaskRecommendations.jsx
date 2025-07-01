import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getRecommendations, trackRecommendationInteraction } from '../../api'

const TaskRecommendations = ({ onTaskSelect }) => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      const data = await getRecommendations()
      setRecommendations(data || [])
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecommendationClick = async (recommendation, action = 'viewed') => {
    try {
      await trackRecommendationInteraction(recommendation.id, { action })
      if (onTaskSelect) {
        onTaskSelect(recommendation)
      }
    } catch (error) {
      console.error('Failed to track interaction:', error)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return AlertCircle
      case 'medium':
        return Clock
      case 'low':
        return Lightbulb
      default:
        return Lightbulb
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Personalized task suggestions for you</p>
          </div>
        </div>
        
        {user?.role === 'hr_admin' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>ML-Powered</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => {
            const Icon = getPriorityIcon(rec.priority)
            const colorClass = getPriorityColor(rec.priority)
            
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-l-4 rounded-lg p-4 ${colorClass} hover:shadow-md transition-all cursor-pointer group`}
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      {rec.score && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className={`text-xs font-medium ${getScoreColor(rec.score)}`}>
                            {Math.round(rec.score * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.estimatedTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {rec.priority} priority
                        </span>
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {rec.category}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    {rec.reasons && rec.reasons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Why this is recommended:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.reasons.slice(0, 2).map((reason, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h4>
            <p className="text-sm text-gray-500 mb-4">
              {user?.role === 'new_hire' 
                ? "Complete more tasks to get personalized recommendations"
                : "No new task recommendations at this time"
              }
            </p>
            {user?.role === 'new_hire' && (
              <button className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                View All Tasks
              </button>
            )}
          </div>
        )}
      </div>
      
      {recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-500">
              <Users className="w-4 h-4" />
              <span>Based on similar users and your progress</span>
            </div>
            <button 
              onClick={() => loadRecommendations()}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskRecommendations
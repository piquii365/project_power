import React from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Clock, ArrowRight, AlertCircle } from 'lucide-react'

const AIRecommendations = ({ recommendations = [] }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-error-500 bg-error-50'
      case 'medium':
        return 'border-l-warning-500 bg-warning-50'
      case 'low':
        return 'border-l-success-500 bg-success-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
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
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.estimatedTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-error-100 text-error-700' :
                          rec.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
                          'bg-success-100 text-success-700'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recommendations available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIRecommendations
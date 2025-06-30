import React from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, UserPlus, MessageCircle, AlertCircle } from 'lucide-react'

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'completion':
        return CheckCircle
      case 'start':
        return UserPlus
      case 'chat':
        return MessageCircle
      case 'help':
        return AlertCircle
      default:
        return Clock
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'completion':
        return 'text-success-600 bg-success-100'
      case 'start':
        return 'text-primary-600 bg-primary-100'
      case 'chat':
        return 'text-warning-600 bg-warning-100'
      case 'help':
        return 'text-error-600 bg-error-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                {activity.avatar && (
                  <img
                    src={activity.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </motion.div>
            )
          })
        ) : (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivity
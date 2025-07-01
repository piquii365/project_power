import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Star,
  AlertCircle,
  FileText,
  ExternalLink,
  Calendar,
  Target,
  Award
} from 'lucide-react'

const TaskDetails = ({ task, onClose, onStart, onComplete, onUpdate }) => {
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')

  if (!task) return null

  const getTaskIcon = (type) => {
    const icons = {
      video: Play,
      document: BookOpen,
      interactive: AlertCircle,
      meeting: Users,
      'hands-on': Award,
      project: Target
    }
    return icons[type] || BookOpen
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getCategoryColor = (category) => {
    const colors = {
      company: 'bg-blue-100 text-blue-800',
      security: 'bg-red-100 text-red-800',
      hr: 'bg-purple-100 text-purple-800',
      team: 'bg-green-100 text-green-800',
      technical: 'bg-orange-100 text-orange-800',
      project: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        feedback,
        rating: rating > 0 ? rating : null,
        notes
      })
    }
  }

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate({
        feedback,
        rating: rating > 0 ? rating : null,
        notes
      })
    }
  }

  const Icon = getTaskIcon(task.type)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Icon className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h2>
                <p className="text-gray-600">{task.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Duration</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{task.estimatedDuration} minutes</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Category</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Priority</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>

          {/* Progress */}
          {task.status !== 'not_started' && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Progress</span>
                <span className="text-sm font-bold text-blue-900">{task.progress}%</span>
              </div>
              <div className="bg-blue-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-blue-600 mt-2">
                <span>Status: {task.status.replace('_', ' ')}</span>
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}

          {/* Task Content */}
          {task.content && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Content</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {task.content.modules && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Modules:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {task.content.modules.map((module, index) => (
                        <li key={index} className="text-sm text-gray-600">{module}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {task.content.slides && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Slides:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {task.content.slides.map((slide, index) => (
                        <li key={index} className="text-sm text-gray-600">{slide}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {task.content.videoUrl && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Video:</h4>
                    <a
                      href={task.content.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Watch Video
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
                
                {task.content.quiz && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Includes interactive quiz
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resources */}
          {task.resources && task.resources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3">
                {task.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <FileText className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                    <span className="font-medium text-gray-900 group-hover:text-primary-600">
                      {resource.title}
                    </span>
                    <ExternalLink className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {task.prerequisites && task.prerequisites.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 mb-2">
                      Complete these tasks before starting:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {task.prerequisites.map((prereq, index) => (
                        <li key={index} className="text-sm text-yellow-700">{prereq}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {task.status === 'in_progress' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Update</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Share your thoughts about this task..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (Optional)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add any personal notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Existing Feedback */}
          {(task.feedback || task.rating || task.notes) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Feedback</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {task.rating && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700 mr-2">Rating:</span>
                    <div className="inline-flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= task.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {task.feedback && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Feedback:</span>
                    <p className="text-sm text-gray-600 mt-1">{task.feedback}</p>
                  </div>
                )}
                
                {task.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
            {task.status === 'not_started' && onStart && (
              <button
                onClick={onStart}
                className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Task
              </button>
            )}
            
            {task.status === 'in_progress' && (
              <>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Update Progress
                </button>
                <button
                  onClick={handleComplete}
                  className="flex items-center px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TaskDetails
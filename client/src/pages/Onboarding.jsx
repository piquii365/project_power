import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Play, 
  FileText, 
  Users, 
  Shield,
  Book,
  Award,
  ChevronRight,
  Star
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { getTasks, updateTask } from '../api'

const Onboarding = () => {
  const { user, updateUser } = useAuth()
  const { addNotification } = useNotification()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const tasksData = await getTasks()
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load onboarding tasks'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskStart = async (task) => {
    try {
      await updateTask(task.id, { status: 'in_progress' })
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? { ...t, status: 'in_progress', startedAt: new Date().toISOString() }
            : t
        )
      )
      
      addNotification({
        type: 'info',
        title: 'Task Started',
        message: `You've started "${task.title}"`
      })
    } catch (error) {
      console.error('Failed to start task:', error)
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to start task'
      })
    }
  }

  const handleTaskComplete = async (task) => {
    try {
      await updateTask(task.id, { status: 'completed', progress: 100 })
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? { ...t, status: 'completed', progress: 100, completedAt: new Date().toISOString() }
            : t
        )
      )

      // Update user progress
      const completedTasks = tasks.filter(t => t.status === 'completed' || t.id === task.id).length
      const newProgress = Math.round((completedTasks / tasks.length) * 100)
      updateUser({ onboardingProgress: newProgress })
      
      addNotification({
        type: 'success',
        title: 'Task Completed!',
        message: `Great job completing "${task.title}"`
      })
    } catch (error) {
      console.error('Failed to complete task:', error)
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to complete task'
      })
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'completed') return task.status === 'completed'
    if (filter === 'pending') return task.status !== 'completed'
    if (filter === 'high') return task.priority === 'high'
    return true
  })

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const totalCount = tasks.length
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getTaskIcon = (task) => {
    const iconMap = {
      video: Users,
      interactive: Shield,
      document: FileText,
      meeting: Users,
      'hands-on': Book,
      project: Award
    }
    return iconMap[task.type] || Book
  }

  const TaskCard = ({ task }) => {
    const Icon = getTaskIcon(task)
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white rounded-xl shadow-soft border-l-4 p-6 hover:shadow-hover transition-all cursor-pointer ${
          task.status === 'completed' 
            ? 'border-l-success-500' 
            : isOverdue 
            ? 'border-l-error-500' 
            : task.priority === 'high' 
            ? 'border-l-warning-500' 
            : 'border-l-primary-500'
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              task.status === 'completed' ? 'bg-success-100' : 'bg-gray-100'
            }`}>
              {task.status === 'completed' ? (
                <CheckCircle className="w-5 h-5 text-success-600" />
              ) : (
                <Icon className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {task.estimatedDuration} min
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-error-100 text-error-700' :
                  task.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.priority} priority
                </span>
                {task.dueDate && (
                  <span className={isOverdue ? 'text-error-600 font-medium' : ''}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {task.status !== 'completed' && task.progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{task.progress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-primary-500 rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            task.status === 'completed' ? 'bg-success-100 text-success-800' : 
            task.status === 'in_progress' ? 'bg-primary-100 text-primary-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status === 'completed' ? 'Completed' : 
             task.status === 'in_progress' ? 'In Progress' : 'Not Started'}
          </span>
          
          {task.status !== 'completed' && (
            <div className="flex space-x-2">
              {task.status === 'not_started' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskStart(task)
                  }}
                  className="flex items-center px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskComplete(task)
                  }}
                  className="flex items-center px-3 py-1 bg-success-500 text-white rounded-lg text-sm hover:bg-success-600 transition-colors"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

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
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Onboarding Journey</h1>
        <p className="text-gray-600">
          Complete these tasks to get fully onboarded at ZHD Consulting
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Overall Progress</h2>
            <p className="text-primary-100">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{overallProgress}%</div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(overallProgress / 20) ? 'text-yellow-300 fill-current' : 'text-primary-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-full h-3">
          <motion.div
            className="bg-white rounded-full h-3"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'pending', label: 'Pending' },
            { key: 'completed', label: 'Completed' },
            { key: 'high', label: 'High Priority' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-6">
        <AnimatePresence>
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h2>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedTask.estimatedDuration} min
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTask.priority === 'high' ? 'bg-error-100 text-error-700' :
                  selectedTask.priority === 'medium' ? 'bg-warning-100 text-warning-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedTask.priority} priority
                </span>
                <span className="capitalize">{selectedTask.category}</span>
              </div>

              {selectedTask.content && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Task Content</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedTask.content.modules && (
                      <div>
                        <h4 className="font-medium mb-2">Modules:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedTask.content.modules.map((module, index) => (
                            <li key={index} className="text-sm text-gray-600">{module}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedTask.resources && selectedTask.resources.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Resources</h3>
                  <div className="space-y-2">
                    {selectedTask.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-3 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{resource.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.status !== 'completed' && (
                <div className="flex space-x-3">
                  {selectedTask.status === 'not_started' ? (
                    <button
                      onClick={() => {
                        handleTaskStart(selectedTask)
                        setSelectedTask(null)
                      }}
                      className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Task
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleTaskComplete(selectedTask)
                        setSelectedTask(null)
                      }}
                      className="flex items-center px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Onboarding
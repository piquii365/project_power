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
  Star,
  Filter,
  Search
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { useLocation } from 'react-router-dom'
import { getTasks, updateTask } from '../api'
import TaskDetails from '../components/common/TaskDetails'

const Onboarding = () => {
  const { user, updateUser } = useAuth()
  const { addNotification } = useNotification()
  const location = useLocation()
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    // Check for filter parameter in URL
    const urlParams = new URLSearchParams(location.search)
    const filterParam = urlParams.get('filter')
    if (filterParam) {
      setFilter(filterParam)
    }
  }, [location])

  useEffect(() => {
    filterTasks()
  }, [tasks, filter, searchTerm])

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

  const filterTasks = () => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filter !== 'all') {
      if (filter === 'completed') {
        filtered = filtered.filter(task => task.status === 'completed')
      } else if (filter === 'pending') {
        // Show not started and in progress tasks
        filtered = filtered.filter(task => task.status === 'not_started' || task.status === 'in_progress')
      } else if (filter === 'in_progress') {
        filtered = filtered.filter(task => task.status === 'in_progress')
      } else if (filter === 'not_started') {
        filtered = filtered.filter(task => task.status === 'not_started')
      } else if (filter === 'high') {
        filtered = filtered.filter(task => task.priority === 'high')
      } else {
        filtered = filtered.filter(task => task.category === filter)
      }
    }

    setFilteredTasks(filtered)
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

  const handleTaskComplete = async (task, updateData = {}) => {
    try {
      await updateTask(task.id, { 
        status: 'completed', 
        progress: 100,
        ...updateData
      })
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id
            ? { ...t, status: 'completed', progress: 100, completedAt: new Date().toISOString(), ...updateData }
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

      setSelectedTask(null)
    } catch (error) {
      console.error('Failed to complete task:', error)
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to complete task'
      })
    }
  }

  const handleTaskUpdate = async (task, updateData) => {
    try {
      await updateTask(task.id, updateData)
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id ? { ...t, ...updateData } : t
        )
      )
      
      addNotification({
        type: 'success',
        title: 'Task Updated',
        message: 'Your progress has been saved'
      })
    } catch (error) {
      console.error('Failed to update task:', error)
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update task'
      })
    }
  }

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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.category === 'company' ? 'bg-blue-100 text-blue-700' :
                  task.category === 'security' ? 'bg-red-100 text-red-700' :
                  task.category === 'hr' ? 'bg-purple-100 text-purple-700' :
                  task.category === 'team' ? 'bg-green-100 text-green-700' :
                  task.category === 'technical' ? 'bg-orange-100 text-orange-700' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {task.category}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'pending', label: 'Pending' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'high', label: 'High Priority' },
              { key: 'company', label: 'Company' },
              { key: 'security', label: 'Security' },
              { key: 'technical', label: 'Technical' }
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
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
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

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStart={() => handleTaskStart(selectedTask)}
            onComplete={(updateData) => handleTaskComplete(selectedTask, updateData)}
            onUpdate={(updateData) => handleTaskUpdate(selectedTask, updateData)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Onboarding
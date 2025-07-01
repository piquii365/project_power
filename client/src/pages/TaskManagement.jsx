import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users,
  BookOpen,
  Shield,
  Award,
  Play,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { getTasks, assignTask, getUsers } from '../api'

const TaskManagement = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    taskId: '',
    userId: '',
    dueDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, categoryFilter, priorityFilter, typeFilter])

  const loadData = async () => {
    try {
      const [tasksResponse, usersResponse] = await Promise.all([
        getTasks(),
        getUsers(1, 100)
      ])
      setTasks(tasksResponse || [])
      setUsers(usersResponse.users || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load tasks and users'
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

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === typeFilter)
    }

    setFilteredTasks(filtered)
  }

  const handleAssignTask = async () => {
    try {
      await assignTask(assignmentData)
      addNotification({
        type: 'success',
        title: 'Task Assigned',
        message: 'Task has been assigned successfully'
      })
      setShowAssignModal(false)
      setAssignmentData({ taskId: '', userId: '', dueDate: '' })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Assignment Failed',
        message: 'Failed to assign task'
      })
    }
  }

  const getTaskIcon = (type) => {
    const icons = {
      video: Play,
      document: BookOpen,
      interactive: Shield,
      meeting: Users,
      'hands-on': Award,
      project: CheckCircle
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
          <p className="text-gray-600">Create, manage, and assign onboarding tasks</p>
        </div>
        
        {user?.role === 'hr_admin' && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Assign Task
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="company">Company</option>
            <option value="security">Security</option>
            <option value="hr">HR</option>
            <option value="team">Team</option>
            <option value="technical">Technical</option>
            <option value="project">Project</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="interactive">Interactive</option>
            <option value="meeting">Meeting</option>
            <option value="hands-on">Hands-on</option>
            <option value="project">Project</option>
          </select>
          
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen className="w-4 h-4 mr-2" />
            {filteredTasks.length} tasks
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-6">
        {filteredTasks.map(task => {
          const Icon = getTaskIcon(task.type)
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 hover:shadow-hover transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      {user?.role === 'hr_admin' && (
                        <div className="relative">
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          
                          {selectedTask?.id === task.id && (
                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Task
                              </button>
                              <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority} priority
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {task.estimatedDuration} min
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {task.type}
                      </div>
                    </div>
                    
                    {(task.requiredRole || task.requiredDepartment) && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {task.requiredRole && (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            Role: {task.requiredRole.replace('_', ' ')}
                          </span>
                        )}
                        {task.requiredDepartment && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                            Dept: {task.requiredDepartment}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {task.prerequisites && task.prerequisites.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Prerequisites:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.prerequisites.map((prereq, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {user?.role === 'hr_admin' && (
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setAssignmentData({...assignmentData, taskId: task.id})
                      setShowAssignModal(true)
                    }}
                    className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Assign to User
                  </button>
                  <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Task</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Task
                </label>
                <select
                  value={assignmentData.taskId}
                  onChange={(e) => setAssignmentData({...assignmentData, taskId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={assignmentData.userId}
                  onChange={(e) => setAssignmentData({...assignmentData, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a user...</option>
                  {users.filter(u => u.role === 'new_hire').map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.department})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={assignmentData.dueDate}
                  onChange={(e) => setAssignmentData({...assignmentData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={!assignmentData.taskId || !assignmentData.userId}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Assign Task
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setSelectedTask(null)}
        />
      )}
    </motion.div>
  )
}

export default TaskManagement
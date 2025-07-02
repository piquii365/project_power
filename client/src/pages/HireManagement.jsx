import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  Users,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { getUsers, deleteUser, updateUserRole, assignTask, getTasks } from '../api'
import Breadcrumbs from '../components/common/Breadcrumbs'

const HireManagement = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [hires, setHires] = useState([])
  const [tasks, setTasks] = useState([])
  const [filteredHires, setFilteredHires] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')
  const [selectedHire, setSelectedHire] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    userId: '',
    taskId: '',
    dueDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterHires()
  }, [hires, searchTerm, departmentFilter, progressFilter])

  const loadData = async () => {
    try {
      const [hiresResponse, tasksResponse] = await Promise.all([
        getUsers(1, 100, 'new_hire'),
        getTasks()
      ])
      setHires(hiresResponse.users || [])
      setTasks(tasksResponse || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load hire data'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterHires = () => {
    let filtered = hires

    if (searchTerm) {
      filtered = filtered.filter(hire =>
        hire.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hire.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hire.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(hire => hire.department === departmentFilter)
    }

    if (progressFilter !== 'all') {
      if (progressFilter === 'completed') {
        filtered = filtered.filter(hire => hire.onboardingProgress >= 100)
      } else if (progressFilter === 'in_progress') {
        filtered = filtered.filter(hire => hire.onboardingProgress > 0 && hire.onboardingProgress < 100)
      } else if (progressFilter === 'not_started') {
        filtered = filtered.filter(hire => hire.onboardingProgress === 0)
      }
    }

    setFilteredHires(filtered)
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
      setAssignmentData({ userId: '', taskId: '', dueDate: '' })
      await loadData()
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Assignment Failed',
        message: 'Failed to assign task'
      })
    }
  }

  const handleDeleteHire = async (hireId) => {
    if (window.confirm('Are you sure you want to deactivate this hire?')) {
      try {
        await deleteUser(hireId)
        await loadData()
        addNotification({
          type: 'success',
          title: 'Hire Deactivated',
          message: 'Hire has been deactivated successfully'
        })
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Deactivation Failed',
          message: 'Failed to deactivate hire'
        })
      }
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600 bg-green-100'
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100'
    if (progress > 0) return 'text-blue-600 bg-blue-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getProgressStatus = (progress) => {
    if (progress >= 100) return 'Completed'
    if (progress >= 50) return 'On Track'
    if (progress > 0) return 'In Progress'
    return 'Not Started'
  }

  const getDaysOnboarding = (startDate) => {
    if (!startDate) return 0
    return Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24))
  }

  const departments = [...new Set(hires.map(h => h.department).filter(Boolean))]

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
      <Breadcrumbs />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Hire Management</h1>
          <p className="text-gray-600">Monitor and manage new hire onboarding progress</p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Target className="w-4 h-4 mr-2" />
            Assign Task
          </button>
          <Link
            to="/hires/add-hire"
            className="flex items-center px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Hire
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total New Hires</p>
              <p className="text-3xl font-bold text-gray-900">{hires.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">
                {hires.filter(h => h.onboardingProgress >= 100).length}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {hires.filter(h => h.onboardingProgress > 0 && h.onboardingProgress < 100).length}
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {hires.length > 0 ? Math.round(hires.reduce((sum, h) => sum + h.onboardingProgress, 0) / hires.length) : 0}%
              </p>
            </div>
            <div className="p-3 bg-error-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search hires..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Progress</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            {filteredHires.length} hires
          </div>
        </div>
      </div>

      {/* Hires List */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Hire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Onboarding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHires.map(hire => (
                <tr key={hire.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={hire.avatar}
                        alt={hire.name}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hire.name}</div>
                        <div className="text-sm text-gray-500">{hire.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hire.department}</div>
                    <div className="text-sm text-gray-500">{hire.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-primary-500 rounded-full h-2 transition-all duration-500"
                          style={{ width: `${hire.onboardingProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {hire.onboardingProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDaysOnboarding(hire.startDate)} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProgressColor(hire.onboardingProgress)}`}>
                      {getProgressStatus(hire.onboardingProgress)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedHire(hire)
                          setShowDetailsModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAssignmentData({...assignmentData, userId: hire.id})
                          setShowAssignModal(true)
                        }}
                        className="text-success-600 hover:text-success-900"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHire(hire.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hire Details Modal */}
      {showDetailsModal && selectedHire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedHire.name} - Onboarding Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedHire.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <p className="font-medium">{selectedHire.department}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Position:</span>
                    <p className="font-medium">{selectedHire.position}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <p className="font-medium">
                      {selectedHire.startDate ? new Date(selectedHire.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Stats */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Progress Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedHire.stats?.completedTasks || 0}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedHire.stats?.tasksInProgress || 0}
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedHire.onboardingProgress}%
                    </div>
                    <div className="text-sm text-gray-600">Overall</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                  Select Hire
                </label>
                <select
                  value={assignmentData.userId}
                  onChange={(e) => setAssignmentData({...assignmentData, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a hire...</option>
                  {hires.map(hire => (
                    <option key={hire.id} value={hire.id}>{hire.name} ({hire.department})</option>
                  ))}
                </select>
              </div>
              
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
                disabled={!assignmentData.userId || !assignmentData.taskId}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Assign Task
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default HireManagement
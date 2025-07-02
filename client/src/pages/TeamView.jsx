import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Clock,
  MessageCircle,
  UserPlus,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { getUsers, deleteUser, updateUserRole } from '../api'
import Breadcrumbs from '../components/common/Breadcrumbs'

const TeamView = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [teamMembers, setTeamMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadTeamMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [teamMembers, searchTerm, roleFilter, departmentFilter])

  const loadTeamMembers = async () => {
    try {
      const response = await getUsers(1, 100)
      setTeamMembers(response.users || [])
    } catch (error) {
      console.error('Failed to load team members:', error)
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load team members'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = teamMembers

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(member => member.department === departmentFilter)
    }

    setFilteredMembers(filtered)
  }

  const handleRoleUpdate = async (memberId, newRole) => {
    try {
      await updateUserRole(memberId, { role: newRole })
      await loadTeamMembers()
      addNotification({
        type: 'success',
        title: 'Role Updated',
        message: 'User role updated successfully'
      })
      setShowEditModal(false)
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update user role'
      })
    }
  }

  const handleDeleteUser = async (memberId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deleteUser(memberId)
        await loadTeamMembers()
        addNotification({
          type: 'success',
          title: 'User Deactivated',
          message: 'User has been deactivated successfully'
        })
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Deactivation Failed',
          message: 'Failed to deactivate user'
        })
      }
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      hr_admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800',
      new_hire: 'bg-orange-100 text-orange-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const departments = [...new Set(teamMembers.map(m => m.department).filter(Boolean))]
  const roles = [...new Set(teamMembers.map(m => m.role))]

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Directory</h1>
          <p className="text-gray-600">Manage and view all team members</p>
        </div>
        
        {user?.role === 'hr_admin' && (
          <Link
            to="/team/add-member"
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors mt-4 sm:mt-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Member
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>
                {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          
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
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            {filteredMembers.length} members
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 hover:shadow-hover transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.position}</p>
                </div>
              </div>
              
              {user?.role === 'hr_admin' && (
                <div className="relative">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {selectedMember?.id === member.id && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <button
                        onClick={() => {
                          setShowEditModal(true)
                          setSelectedMember(member)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(member.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deactivate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                  {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {member.role === 'new_hire' && (
                  <div className={`text-sm font-medium ${getProgressColor(member.stats?.progressPercentage || 0)}`}>
                    {member.stats?.progressPercentage || 0}% Complete
                  </div>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>

              {member.department && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {member.department}
                </div>
              )}

              {member.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {member.location}
                </div>
              )}

              {member.startDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Started {new Date(member.startDate).toLocaleDateString()}
                </div>
              )}

              {member.role === 'new_hire' && member.stats && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{member.stats.progressPercentage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${member.stats.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>{member.stats.completedTasks}/{member.stats.totalTasks} tasks</span>
                    <span>{member.stats.tasksInProgress} in progress</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
              <button className="flex items-center justify-center flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </button>
              <button className="flex items-center justify-center flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                <Award className="w-4 h-4 mr-1" />
                Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Role for {selectedMember.name}
            </h3>
            
            <div className="space-y-3 mb-6">
              {['new_hire', 'employee', 'manager', 'hr_admin'].map(role => (
                <label key={role} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedMember.role === role}
                    onChange={() => setSelectedMember({...selectedMember, role})}
                    className="mr-3"
                  />
                  <span className="capitalize">
                    {role.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRoleUpdate(selectedMember.id, selectedMember.role)}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Update Role
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setSelectedMember(null)}
        />
      )}
    </motion.div>
  )
}

export default TeamView
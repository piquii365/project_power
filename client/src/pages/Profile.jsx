import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  Target,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'

const Profile = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    department: user?.department || '',
    role: user?.role || '',
    startDate: user?.startDate || '',
    bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Excited to join the ZHD Consulting team and contribute to innovative projects.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    goals: [
      { id: 1, title: 'Complete onboarding within 2 weeks', completed: true },
      { id: 2, title: 'Master company tech stack', completed: false },
      { id: 3, title: 'Complete first project successfully', completed: false },
      { id: 4, title: 'Build relationships with team members', completed: true }
    ]
  })

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false)
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      })
    }, 500)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data
    setProfileData(prev => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
    }))
  }

  const ProfileField = ({ label, value, icon: Icon, editable = false, type = 'text' }) => (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        {isEditing && editable ? (
          type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => setProfileData(prev => ({ ...prev, [label.toLowerCase()]: e.target.value }))}
              className="w-full p-2 border border-gray-200 rounded text-sm"
              rows="3"
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => setProfileData(prev => ({ ...prev, [label.toLowerCase().replace(' ', '')]: e.target.value }))}
              className="w-full p-2 border border-gray-200 rounded text-sm"
            />
          )
        ) : (
          <p className="text-gray-900 font-medium">{value}</p>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <button className="absolute -bottom-1 -right-1 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">{profileData.name}</h2>
              <p className="text-gray-600 capitalize">{profileData.role?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500">{profileData.department}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{user?.progress || 65}%</div>
                <div className="text-xs text-primary-700 font-medium">Progress</div>
              </div>
              <div className="text-center p-3 bg-success-50 rounded-lg">
                <div className="text-2xl font-bold text-success-600">12</div>
                <div className="text-xs text-success-700 font-medium">Completed</div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Goals Progress */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Goals Progress</h3>
              <div className="space-y-2">
                {profileData.goals.map(goal => (
                  <div key={goal.id} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      goal.completed ? 'bg-success-500' : 'bg-gray-300'
                    }`}>
                      {goal.completed && <Award className="w-2 h-2 text-white" />}
                    </div>
                    <span className={`text-xs ${
                      goal.completed ? 'text-gray-900 line-through' : 'text-gray-600'
                    }`}>
                      {goal.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileField 
                label="Full Name" 
                value={profileData.name} 
                icon={User} 
                editable={true}
              />
              <ProfileField 
                label="Email" 
                value={profileData.email} 
                icon={Mail} 
                editable={true}
                type="email"
              />
              <ProfileField 
                label="Phone" 
                value={profileData.phone} 
                icon={Phone} 
                editable={true}
                type="tel"
              />
              <ProfileField 
                label="Location" 
                value={profileData.location} 
                icon={MapPin} 
                editable={true}
              />
              <ProfileField 
                label="Start Date" 
                value={new Date(profileData.startDate).toLocaleDateString()} 
                icon={Calendar} 
              />
              <ProfileField 
                label="Department" 
                value={profileData.department} 
                icon={Target} 
              />
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-4 border border-gray-200 rounded-lg text-sm leading-relaxed"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed">{profileData.bio}</p>
            )}
          </div>

          {/* Onboarding Progress */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Journey</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success-500 rounded-full">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-success-900">Welcome & Company Overview</p>
                    <p className="text-sm text-success-700">Completed on Jan 15, 2024</p>
                  </div>
                </div>
                <Award className="w-5 h-5 text-success-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500 rounded-full">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-900">IT Security Training</p>
                    <p className="text-sm text-primary-700">In progress - 75% complete</p>
                  </div>
                </div>
                <div className="text-primary-500 font-bold">75%</div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-400 rounded-full">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Team Introduction</p>
                    <p className="text-sm text-gray-600">Scheduled for Jan 22, 2024</p>
                  </div>
                </div>
                <div className="text-gray-400 font-bold">0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Profile
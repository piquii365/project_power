import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Briefcase,
  Calendar,
  Save,
  X,
  Upload,
  Sparkles,
  Clock,
  BookOpen,
  Target,
  Users,
  Shield,
  Award,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../contexts/NotificationContext'
import Breadcrumbs from '../common/Breadcrumbs'

const AddNewHire = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'new_hire',
    location: '',
    startDate: '',
    manager: '',
    avatar: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      learningStyle: 'visual',
      communicationPreference: 'email',
      workSchedule: 'full-time'
    }
  })

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Operations',
    'Human Resources',
    'Finance',
    'Customer Success',
    'Design'
  ]

  const learningStyles = [
    { value: 'visual', label: 'Visual Learner' },
    { value: 'auditory', label: 'Auditory Learner' },
    { value: 'kinesthetic', label: 'Hands-on Learner' },
    { value: 'reading', label: 'Reading/Writing Learner' }
  ]

  const workSchedules = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const generateAIOnboardingPlan = () => {
    const plan = {
      timeline: '14 days',
      totalTasks: 0,
      weeklyBreakdown: [],
      recommendedTasks: [],
      mentorSuggestions: [],
      riskFactors: [],
      successPrediction: 0
    }

    // AI-powered recommendations based on role and department
    if (formData.department === 'Engineering') {
      plan.totalTasks = 12
      plan.recommendedTasks = [
        {
          title: 'Development Environment Setup',
          type: 'hands-on',
          priority: 'high',
          duration: 120,
          day: 1,
          category: 'technical'
        },
        {
          title: 'Code Review Process Training',
          type: 'interactive',
          priority: 'high',
          duration: 60,
          day: 3,
          category: 'technical'
        },
        {
          title: 'Architecture Overview Session',
          type: 'meeting',
          priority: 'medium',
          duration: 90,
          day: 5,
          category: 'technical'
        },
        {
          title: 'First Code Contribution',
          type: 'project',
          priority: 'medium',
          duration: 240,
          day: 10,
          category: 'project'
        }
      ]
      plan.mentorSuggestions = [
        { name: 'Senior Developer', match: 95 },
        { name: 'Tech Lead', match: 88 },
        { name: 'DevOps Engineer', match: 75 }
      ]
      plan.successPrediction = 87
    } else if (formData.department === 'Sales') {
      plan.totalTasks = 10
      plan.recommendedTasks = [
        {
          title: 'CRM System Training',
          type: 'interactive',
          priority: 'high',
          duration: 90,
          day: 1,
          category: 'technical'
        },
        {
          title: 'Sales Process Overview',
          type: 'video',
          priority: 'high',
          duration: 45,
          day: 2,
          category: 'company'
        },
        {
          title: 'Product Knowledge Deep Dive',
          type: 'document',
          priority: 'high',
          duration: 120,
          day: 4,
          category: 'company'
        },
        {
          title: 'Shadow Sales Calls',
          type: 'meeting',
          priority: 'medium',
          duration: 180,
          day: 7,
          category: 'team'
        }
      ]
      plan.mentorSuggestions = [
        { name: 'Sales Manager', match: 92 },
        { name: 'Senior Sales Rep', match: 85 },
        { name: 'Customer Success Manager', match: 78 }
      ]
      plan.successPrediction = 82
    } else if (formData.department === 'Marketing') {
      plan.totalTasks = 9
      plan.recommendedTasks = [
        {
          title: 'Brand Guidelines Training',
          type: 'document',
          priority: 'high',
          duration: 60,
          day: 1,
          category: 'company'
        },
        {
          title: 'Marketing Tools Overview',
          type: 'interactive',
          priority: 'high',
          duration: 75,
          day: 2,
          category: 'technical'
        },
        {
          title: 'Campaign Strategy Workshop',
          type: 'meeting',
          priority: 'medium',
          duration: 120,
          day: 5,
          category: 'team'
        }
      ]
      plan.mentorSuggestions = [
        { name: 'Marketing Manager', match: 90 },
        { name: 'Content Strategist', match: 83 },
        { name: 'Digital Marketing Specialist', match: 79 }
      ]
      plan.successPrediction = 85
    }

    // Add universal tasks
    const universalTasks = [
      {
        title: 'Welcome & Company Overview',
        type: 'video',
        priority: 'high',
        duration: 30,
        day: 1,
        category: 'company'
      },
      {
        title: 'IT Security Training',
        type: 'interactive',
        priority: 'high',
        duration: 45,
        day: 1,
        category: 'security'
      },
      {
        title: 'HR Policies & Benefits',
        type: 'document',
        priority: 'medium',
        duration: 60,
        day: 2,
        category: 'hr'
      }
    ]

    plan.recommendedTasks = [...universalTasks, ...plan.recommendedTasks]
    plan.totalTasks += universalTasks.length

    // Calculate weekly breakdown
    plan.weeklyBreakdown = [
      {
        week: 1,
        tasks: plan.recommendedTasks.filter(task => task.day <= 7).length,
        focus: 'Foundation & Setup',
        completion: 60
      },
      {
        week: 2,
        tasks: plan.recommendedTasks.filter(task => task.day > 7).length,
        focus: 'Integration & Practice',
        completion: 40
      }
    ]

    // Risk factors based on learning style and department
    if (formData.preferences.learningStyle === 'kinesthetic' && formData.department === 'Engineering') {
      plan.riskFactors.push('Consider more hands-on coding exercises')
    }
    if (formData.preferences.workSchedule === 'part-time') {
      plan.riskFactors.push('Extended timeline may be needed for part-time schedule')
    }

    return plan
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate AI onboarding plan
      const aiPlan = generateAIOnboardingPlan()

      addNotification({
        type: 'success',
        title: 'New Hire Added Successfully',
        message: `${formData.firstName} ${formData.lastName} has been added with a personalized ${aiPlan.timeline} onboarding plan.`
      })

      // Show AI plan summary
      addNotification({
        type: 'info',
        title: 'AI Onboarding Plan Generated',
        message: `Created ${aiPlan.totalTasks} personalized tasks with ${aiPlan.successPrediction}% predicted success rate.`
      })

      navigate('/hires')
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add new hire. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/hires')
  }

  const aiPlan = formData.department ? generateAIOnboardingPlan() : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-6xl mx-auto"
    >
      <Breadcrumbs />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Hire</h1>
          <p className="text-gray-600">Create a comprehensive profile with AI-powered onboarding recommendations</p>
        </div>
        
        <button
          onClick={() => setShowAIRecommendations(!showAIRecommendations)}
          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {showAIRecommendations ? 'Hide' : 'Show'} AI Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <UserPlus className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Briefcase className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter position title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direct Manager
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter manager name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Schedule
                  </label>
                  <select
                    name="preferences.workSchedule"
                    value={formData.preferences.workSchedule}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {workSchedules.map(schedule => (
                      <option key={schedule.value} value={schedule.value}>{schedule.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Learning Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Style
                  </label>
                  <select
                    name="preferences.learningStyle"
                    value={formData.preferences.learningStyle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {learningStyles.map(style => (
                      <option key={style.value} value={style.value}>{style.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Preference
                  </label>
                  <select
                    name="preferences.communicationPreference"
                    value={formData.preferences.communicationPreference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="slack">Slack</option>
                    <option value="phone">Phone</option>
                    <option value="in-person">In-person</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Creating Profile...' : 'Add New Hire'}
              </button>
            </div>
          </form>
        </div>

        {/* AI Onboarding Plan Sidebar */}
        {showAIRecommendations && aiPlan && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">AI Onboarding Plan</h3>
              </div>

              {/* Plan Overview */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-900">{aiPlan.timeline}</div>
                    <div className="text-xs text-purple-600">Timeline</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-900">{aiPlan.totalTasks}</div>
                    <div className="text-xs text-purple-600">Tasks</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">Success Prediction</span>
                    <span className="text-lg font-bold text-purple-900">{aiPlan.successPrediction}%</span>
                  </div>
                  <div className="bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${aiPlan.successPrediction}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Weekly Breakdown */}
              <div className="mb-6">
                <h4 className="font-medium text-purple-800 mb-3">Weekly Breakdown:</h4>
                <div className="space-y-3">
                  {aiPlan.weeklyBreakdown.map((week, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-purple-900">Week {week.week}</span>
                        <span className="text-sm text-purple-600">{week.tasks} tasks</span>
                      </div>
                      <div className="text-sm text-purple-700 mb-2">{week.focus}</div>
                      <div className="bg-purple-200 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 rounded-full h-1.5"
                          style={{ width: `${week.completion}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Tasks */}
              <div className="mb-6">
                <h4 className="font-medium text-purple-800 mb-3">Key Tasks:</h4>
                <div className="space-y-2">
                  {aiPlan.recommendedTasks.slice(0, 4).map((task, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-purple-900 text-sm">{task.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-purple-600">Day {task.day}</span>
                          </div>
                        </div>
                        <div className="ml-2">
                          {task.type === 'video' && <Play className="w-4 h-4 text-purple-500" />}
                          {task.type === 'document' && <FileText className="w-4 h-4 text-purple-500" />}
                          {task.type === 'interactive' && <Target className="w-4 h-4 text-purple-500" />}
                          {task.type === 'meeting' && <Users className="w-4 h-4 text-purple-500" />}
                          {task.type === 'hands-on' && <Award className="w-4 h-4 text-purple-500" />}
                          {task.type === 'project' && <BookOpen className="w-4 h-4 text-purple-500" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Suggestions */}
              {aiPlan.mentorSuggestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-purple-800 mb-3">Recommended Mentors:</h4>
                  <div className="space-y-2">
                    {aiPlan.mentorSuggestions.map((mentor, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-purple-900 text-sm">{mentor.name}</span>
                          <span className="text-xs text-purple-600">{mentor.match}% match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors */}
              {aiPlan.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-medium text-purple-800 mb-3">Considerations:</h4>
                  <div className="space-y-2">
                    {aiPlan.riskFactors.map((risk, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <Lightbulb className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800">{risk}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-purple-100 rounded-lg">
                <p className="text-xs text-purple-700">
                  💡 This AI-generated plan is based on role requirements, department best practices, and learning preferences.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default AddNewHire
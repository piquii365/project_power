import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  Save,
  X,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
  Lightbulb,
  Target,
  Play,
  FileText,
  Shield,
  Award
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../contexts/NotificationContext'
import Breadcrumbs from '../common/Breadcrumbs'

const AddTask = () => {
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    category: 'company',
    priority: 'medium',
    estimatedDuration: 30,
    requiredRole: '',
    requiredDepartment: '',
    prerequisites: [],
    content: {
      modules: [],
      videoUrl: '',
      documents: [],
      quiz: false
    },
    resources: []
  })

  const taskTypes = [
    { value: 'video', label: 'Video Training', icon: Play },
    { value: 'document', label: 'Document Review', icon: FileText },
    { value: 'interactive', label: 'Interactive Training', icon: Target },
    { value: 'meeting', label: 'Meeting/Session', icon: Users },
    { value: 'hands-on', label: 'Hands-on Practice', icon: Award },
    { value: 'project', label: 'Project Work', icon: BookOpen }
  ]

  const categories = [
    { value: 'company', label: 'Company Overview', icon: BookOpen },
    { value: 'security', label: 'Security & Compliance', icon: Shield },
    { value: 'hr', label: 'HR & Policies', icon: Users },
    { value: 'team', label: 'Team Integration', icon: Users },
    { value: 'technical', label: 'Technical Skills', icon: Target },
    { value: 'project', label: 'Project Work', icon: Award }
  ]

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'High Priority', color: 'text-red-600 bg-red-100' }
  ]

  const departments = [
    'Engineering', 'Sales', 'Marketing', 'Operations', 'Human Resources', 'Finance', 'Customer Success', 'Design'
  ]

  const roles = [
    { value: 'new_hire', label: 'New Hire' },
    { value: 'employee', label: 'Employee' },
    { value: 'manager', label: 'Manager' },
    { value: 'hr_admin', label: 'HR Administrator' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const generateAIRecommendations = () => {
    const recommendations = {
      titleSuggestions: [],
      contentSuggestions: [],
      durationEstimate: null,
      similarTasks: []
    }

    // AI-powered suggestions based on category and type
    if (formData.category === 'security' && formData.type === 'interactive') {
      recommendations.titleSuggestions = [
        'Cybersecurity Fundamentals Training',
        'Data Protection and Privacy Compliance',
        'Phishing Awareness and Prevention'
      ]
      recommendations.contentSuggestions = [
        'Password security best practices',
        'Recognizing social engineering attacks',
        'Secure data handling procedures',
        'Incident reporting protocols'
      ]
      recommendations.durationEstimate = 45
    } else if (formData.category === 'company' && formData.type === 'video') {
      recommendations.titleSuggestions = [
        'Company Culture and Values Overview',
        'Mission and Vision Deep Dive',
        'Organizational Structure Walkthrough'
      ]
      recommendations.contentSuggestions = [
        'Company history and milestones',
        'Core values and principles',
        'Leadership team introductions',
        'Company culture examples'
      ]
      recommendations.durationEstimate = 20
    } else if (formData.category === 'technical' && formData.type === 'hands-on') {
      recommendations.titleSuggestions = [
        'Development Environment Setup',
        'Code Review Process Training',
        'Testing Framework Introduction'
      ]
      recommendations.contentSuggestions = [
        'IDE configuration and plugins',
        'Version control workflows',
        'Code quality standards',
        'Debugging techniques'
      ]
      recommendations.durationEstimate = 90
    }

    return recommendations
  }

  const applyAIRecommendation = (type, value) => {
    if (type === 'title') {
      setFormData(prev => ({ ...prev, title: value }))
    } else if (type === 'duration') {
      setFormData(prev => ({ ...prev, estimatedDuration: value }))
    } else if (type === 'content') {
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          modules: [...prev.content.modules, value]
        }
      }))
    }
  }

  const addResource = () => {
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, { title: '', url: '' }]
    }))
  }

  const updateResource = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map((resource, i) => 
        i === index ? { ...resource, [field]: value } : resource
      )
    }))
  }

  const removeResource = (index) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Make API call to create task
      const response = await fetch('/api/onboarding/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }

      const data = await response.json()

      addNotification({
        type: 'success',
        title: 'Task Created',
        message: `"${formData.title}" has been successfully created and added to the task library.`
      })

      // Show auto-assignment notification
      addNotification({
        type: 'info',
        title: 'Auto-Assignment',
        message: 'Task has been automatically assigned to eligible users based on role and department requirements.'
      })

      navigate('/tasks')
    } catch (error) {
      console.error('Error creating task:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create task. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/tasks')
  }

  const aiRecommendations = generateAIRecommendations()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-5xl mx-auto"
    >
      <Breadcrumbs />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Onboarding Task</h1>
          <p className="text-gray-600">Design a new task with AI-powered recommendations and content suggestions</p>
        </div>
        
        <button
          onClick={() => setShowAIRecommendations(!showAIRecommendations)}
          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Assistant
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe what this task involves..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {taskTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      name="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={handleInputChange}
                      required
                      min="5"
                      max="480"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Role
                  </label>
                  <select
                    name="requiredRole"
                    value={formData.requiredRole}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Any Role</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Department
                  </label>
                  <select
                    name="requiredDepartment"
                    value={formData.requiredDepartment}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Any Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Content Configuration */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Content Configuration</h2>
              </div>

              <div className="space-y-4">
                {formData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      name="content.videoUrl"
                      value={formData.content.videoUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/video"
                    />
                  </div>
                )}

                {formData.type === 'interactive' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="content.quiz"
                      checked={formData.content.quiz}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Include interactive quiz
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
                </div>
                <button
                  type="button"
                  onClick={addResource}
                  className="flex items-center px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Resource
                </button>
              </div>

              <div className="space-y-3">
                {formData.resources.map((resource, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={resource.title}
                      onChange={(e) => updateResource(index, 'title', e.target.value)}
                      placeholder="Resource title"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => updateResource(index, 'url', e.target.value)}
                      placeholder="Resource URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
                {loading ? 'Creating Task...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>

        {/* AI Recommendations Sidebar */}
        {showAIRecommendations && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">AI Recommendations</h3>
              </div>

              {aiRecommendations.titleSuggestions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-purple-800 mb-3">Suggested Titles:</h4>
                  <div className="space-y-2">
                    {aiRecommendations.titleSuggestions.map((title, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyAIRecommendation('title', title)}
                        className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-sm"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-purple-900">{title}</span>
                          <Lightbulb className="w-4 h-4 text-purple-500 ml-2 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiRecommendations.durationEstimate && (
                <div className="mb-6">
                  <h4 className="font-medium text-purple-800 mb-3">Recommended Duration:</h4>
                  <button
                    type="button"
                    onClick={() => applyAIRecommendation('duration', aiRecommendations.durationEstimate)}
                    className="w-full p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-purple-900">{aiRecommendations.durationEstimate} minutes</span>
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                  </button>
                </div>
              )}

              {aiRecommendations.contentSuggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-purple-800 mb-3">Content Suggestions:</h4>
                  <div className="space-y-2">
                    {aiRecommendations.contentSuggestions.map((content, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyAIRecommendation('content', content)}
                        className="w-full text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors text-sm"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-purple-900">{content}</span>
                          <Plus className="w-4 h-4 text-purple-500 ml-2 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-purple-100 rounded-lg">
                <p className="text-xs text-purple-700">
                  💡 AI recommendations are based on similar successful tasks and industry best practices.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default AddTask
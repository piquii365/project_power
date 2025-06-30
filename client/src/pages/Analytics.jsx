import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Award,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useAuth } from '../../contexts/AuthContext'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Analytics = () => {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({})

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        overview: {
          totalHires: 47,
          avgOnboardingTime: 5.2,
          completionRate: 87,
          satisfaction: 4.6,
          trends: {
            hires: 12,
            time: -15,
            completion: 8,
            satisfaction: 3
          }
        },
        onboardingProgress: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [
            {
              label: 'Completion Rate %',
              data: [25, 45, 65, 80, 90, 95],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        departmentBreakdown: {
          labels: ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR'],
          datasets: [
            {
              label: 'New Hires',
              data: [18, 12, 8, 6, 3],
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
              ],
              borderWidth: 0
            }
          ]
        },
        taskCompletion: {
          labels: ['IT Security', 'HR Policies', 'Team Intro', 'Tech Setup', 'Projects'],
          datasets: [
            {
              label: 'Completion Rate %',
              data: [95, 89, 78, 82, 65],
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1
            }
          ]
        },
        engagementMetrics: {
          aiChatUsage: 78,
          resourceAccess: 92,
          taskEngagement: 85,
          feedbackScore: 4.2
        }
      })
      setLoading(false)
    }, 1000)
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  if (user?.role !== 'hr_admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-error-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Analytics are only available to HR administrators.</p>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Analytics</h1>
          <p className="text-gray-600">Track performance and insights across all onboarding activities</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={loadAnalyticsData}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total New Hires</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview?.totalHires}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">
                  +{analyticsData.overview?.trends.hires}% vs last period
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Onboarding Time</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview?.avgOnboardingTime}d</p>
                </div>
                <div className="p-3 bg-success-100 rounded-full">
                  <Clock className="w-6 h-6 text-success-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1 rotate-180" />
                <span className="text-sm text-success-600 font-medium">
                  -{analyticsData.overview?.trends.time}% faster
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview?.completionRate}%</p>
                </div>
                <div className="p-3 bg-warning-100 rounded-full">
                  <Award className="w-6 h-6 text-warning-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">
                  +{analyticsData.overview?.trends.completion}% improvement
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overview?.satisfaction}/5</p>
                </div>
                <div className="p-3 bg-error-100 rounded-full">
                  <Award className="w-6 h-6 text-error-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600 font-medium">
                  +{analyticsData.overview?.trends.satisfaction}% higher
                </span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Onboarding Progress */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Progress Over Time</h3>
              <div className="h-64">
                <Line data={analyticsData.onboardingProgress} options={chartOptions} />
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Hires by Department</h3>
              <div className="h-64">
                <Doughnut data={analyticsData.departmentBreakdown} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Task Completion & Engagement */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Task Completion Rates */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Rates</h3>
              <div className="h-64">
                <Bar data={analyticsData.taskCompletion} options={chartOptions} />
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">AI Chat Usage</span>
                    <span className="text-sm font-bold text-gray-900">{analyticsData.engagementMetrics?.aiChatUsage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${analyticsData.engagementMetrics?.aiChatUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Resource Access</span>
                    <span className="text-sm font-bold text-gray-900">{analyticsData.engagementMetrics?.resourceAccess}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-success-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${analyticsData.engagementMetrics?.resourceAccess}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Task Engagement</span>
                    <span className="text-sm font-bold text-gray-900">{analyticsData.engagementMetrics?.taskEngagement}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-warning-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${analyticsData.engagementMetrics?.taskEngagement}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Feedback Score</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold text-gray-900">
                        {analyticsData.engagementMetrics?.feedbackScore}
                      </span>
                      <span className="text-sm text-gray-500">/5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default Analytics
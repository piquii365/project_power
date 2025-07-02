import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  Calendar,
  MessageSquare,
  BookOpen,
  Target,
  ArrowRight,
  CheckCircle,
  Plus,
  UserPlus,
  ClipboardList
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { getOverview, getTasks, getRecommendations } from '../api'
import StatsCard from '../components/common/StatsCard'
import ProgressChart from '../components/common/ProgressChart'
import RecentActivity from '../components/common/RecentActivity'
import TaskRecommendations from '../components/common/TaskRecommendations'

const Dashboard = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [stats, setStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      if (user?.role === 'hr_admin') {
        // Load HR admin dashboard data
        const overview = await getOverview()
        setStats(overview)
        
        // Mock recent activity for HR admin
        setRecentActivity([
          {
            id: 1,
            type: 'completion',
            message: 'John Doe completed Security Training',
            time: '2 hours ago',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1'
          },
          {
            id: 2,
            type: 'start',
            message: 'Sarah Chen started onboarding process',
            time: '4 hours ago',
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1'
          },
          {
            id: 3,
            type: 'help',
            message: 'Mike Johnson requested help with IT setup',
            time: '6 hours ago',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=1'
          }
        ])
      } else {
        // Load new hire dashboard data
        const [tasks, recs] = await Promise.all([
          getTasks(),
          getRecommendations()
        ])
        
        const completedTasks = tasks.filter(task => task.status === 'completed').length
        const totalTasks = tasks.length
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length
        const overdueTasks = tasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
        ).length

        setStats({
          completedTasks,
          totalTasks,
          inProgressTasks,
          overdueTasks,
          progress: user.onboardingProgress || 0
        })

        setRecommendations(recs)
        
        // Mock recent activity for new hire
        setRecentActivity([
          {
            id: 1,
            type: 'completion',
            message: 'You completed "Company Culture Overview"',
            time: '1 hour ago'
          },
          {
            id: 2,
            type: 'assignment',
            message: 'New task assigned: "IT Security Training"',
            time: '3 hours ago'
          },
          {
            id: 3,
            type: 'chat',
            message: 'AI Assistant helped with benefits questions',
            time: '5 hours ago'
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      addNotification({
        type: 'error',
        title: 'Dashboard Error',
        message: 'Failed to load dashboard data'
      })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (user?.role === "hr_admin") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with onboarding today
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total New Hires"
            value={stats.totalHires || 0}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            color="primary"
          />
          <StatsCard
            title="Avg. Onboarding Time"
            value={`${stats.avgOnboardingTime || 0} days`}
            icon={Clock}
            trend={{ value: 15, isPositive: false }}
            color="success"
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats.completionRate || 0}%`}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
            color="warning"
          />
          <StatsCard
            title="Satisfaction Score"
            value={stats.satisfaction || 0}
            icon={Award}
            trend={{ value: 3, isPositive: true }}
            color="error"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/hires/add-hire"
                className="flex items-center justify-between p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900">
                    Add New Hire
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/tasks/add-task"
                className="flex items-center justify-between p-4 bg-success-50 rounded-xl hover:bg-success-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5 text-success-600" />
                  <span className="font-medium text-success-900">
                    Create Task
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-success-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/team"
                className="flex items-center justify-between p-4 bg-warning-50 rounded-xl hover:bg-warning-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-warning-600" />
                  <span className="font-medium text-warning-900">
                    View Team
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-warning-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/analytics"
                className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">
                    View Analytics
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Chart */}
          <motion.div variants={itemVariants}>
            <ProgressChart />
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <RecentActivity activities={recentActivity} />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // New hire dashboard
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to ZHD Consulting, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          Let's get you up to speed. You're {stats.progress}% through your
          onboarding journey.
        </p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Your Progress</h2>
            <p className="text-primary-100">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.progress}%</div>
            <p className="text-primary-100">Keep going!</p>
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-full h-3 mb-4">
          <motion.div
            className="bg-white rounded-full h-3"
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-primary-100">
            Started:{" "}
            {user.startDate
              ? new Date(user.startDate).toLocaleDateString()
              : "Today"}
          </span>
          <span className="text-primary-100">Target: 2 weeks</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTasks}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <Clock className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inProgressTasks}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTasks - stats.completedTasks}
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-error-100 rounded-lg">
              <Target className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.progress}%
              </p>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Recommendations */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <TaskRecommendations recommendations={recommendations} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <RecentActivity activities={recentActivity} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/chat"
              className="flex items-center justify-between p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">
                  Ask AI Assistant
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/onboarding?filter=pending"
              className="flex items-center justify-between p-4 bg-success-50 rounded-xl hover:bg-success-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-success-600" />
                <span className="font-medium text-success-900">
                  Continue Learning
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-success-600 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/onboarding"
              className="flex items-center justify-between p-4 bg-warning-50 rounded-xl hover:bg-warning-100 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-warning-600" />
                <span className="font-medium text-warning-900">
                  View All Tasks
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-warning-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Users, 
  MessageCircle, 
  BarChart3, 
  User,
  X,
  BookOpen,
  Target,
  Calendar,
  UserCheck,
  Settings,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Onboarding', href: '/onboarding', icon: BookOpen },
    { name: 'AI Assistant', href: '/chat', icon: MessageCircle },
    { name: 'Team Directory', href: '/team', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, adminOnly: true },
    { name: 'Task Management', href: '/tasks', icon: ClipboardList, adminOnly: true },
    { name: 'Hire Management', href: '/hires', icon: UserCheck, adminOnly: true },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const filteredItems = navigationItems.filter(item => 
    !item.adminOnly || user?.role === 'hr_admin'
  )

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isOpen ? 0 : -300 }}
          exit={{ x: -300 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className={`
            fixed top-16 left-0 h-full w-64 bg-white border-r border-gray-200 z-30
            md:relative md:top-0 md:translate-x-0 md:block
            ${isOpen ? 'block' : 'hidden md:block'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Close Button */}
            <div className="flex justify-end p-4 md:hidden">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4">
              <ul className="space-y-2">
                {filteredItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        onClick={() => onClose()}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Progress Summary for New Hires */}
            {user?.role === 'new_hire' && (
              <div className="p-4 border-t border-gray-200">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Onboarding Progress</span>
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${user.progress || user.onboardingProgress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{user.progress || user.onboardingProgress || 0}%</span>
                  </div>
                  <p className="text-xs mt-2 opacity-90">
                    {(user.progress || user.onboardingProgress || 0) < 100 ? 'Keep going! You\'re doing great.' : 'Congratulations! Welcome to the team.'}
                  </p>
                </div>
              </div>
            )}

            {/* Admin Quick Stats */}
            {user?.role === 'hr_admin' && (
              <div className="p-4 border-t border-gray-200">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Admin Dashboard</span>
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-90">Active Hires:</span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Avg Progress:</span>
                      <span className="font-bold">73%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-90">Tasks Assigned:</span>
                      <span className="font-bold">156</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      </AnimatePresence>
    </>
  )
}

export default Sidebar
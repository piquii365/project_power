import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  const breadcrumbNameMap = {
    dashboard: 'Dashboard',
    onboarding: 'Onboarding',
    chat: 'AI Assistant',
    team: 'Team Directory',
    analytics: 'Analytics',
    tasks: 'Task Management',
    hires: 'Hire Management',
    profile: 'Profile',
    'add-member': 'Add Team Member',
    'add-task': 'Add New Task'
  }

  if (pathnames.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-primary-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const breadcrumbName = breadcrumbNameMap[pathname] || pathname

        return (
          <React.Fragment key={pathname}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{breadcrumbName}</span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-primary-600 transition-colors"
              >
                {breadcrumbName}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
import sequelize from '../config/database.js'
import { User, OnboardingTask, UserTask } from '../models/index.js'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Clear existing data
    await UserTask.destroy({ where: {} })
    await OnboardingTask.destroy({ where: {} })
    await User.destroy({ where: {} })
    
    // Create HR Admin
    const hrAdmin = await User.create({
      email: 'hr@zhdconsulting.com',
      password: 'demo123',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'hr_admin',
      department: 'Human Resources',
      position: 'HR Manager',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      startDate: new Date('2023-01-15'),
      onboardingProgress: 100,
      isActive: true
    })

    // Create New Hire
    const newHire = await User.create({
      email: 'john.doe@zhdconsulting.com',
      password: 'demo123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'new_hire',
      department: 'Engineering',
      position: 'Software Developer',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
      startDate: new Date(),
      onboardingProgress: 65,
      isActive: true
    })

    console.log('✅ Users created')

    // Create Onboarding Tasks
    const tasks = [
      {
        title: 'Welcome & Company Overview',
        description: 'Learn about ZHD Consulting history, mission, values, and organizational structure',
        type: 'video',
        category: 'company',
        priority: 'high',
        estimatedDuration: 15,
        order: 1,
        content: {
          videoUrl: 'https://example.com/welcome-video',
          slides: ['Company History', 'Mission & Vision', 'Core Values', 'Organizational Chart']
        },
        resources: [
          { title: 'Employee Handbook', url: 'https://example.com/handbook' },
          { title: 'Company Org Chart', url: 'https://example.com/org-chart' }
        ]
      },
      {
        title: 'IT Security Training',
        description: 'Essential cybersecurity practices, password policies, and data protection guidelines',
        type: 'interactive',
        category: 'security',
        priority: 'high',
        estimatedDuration: 45,
        order: 2,
        content: {
          modules: ['Password Security', 'Phishing Awareness', 'Data Protection', 'VPN Usage'],
          quiz: true
        },
        resources: [
          { title: 'Security Policy', url: 'https://example.com/security-policy' },
          { title: 'VPN Setup Guide', url: 'https://example.com/vpn-guide' }
        ]
      },
      {
        title: 'HR Policies & Benefits',
        description: 'Understanding your benefits package, leave policies, and HR procedures',
        type: 'document',
        category: 'hr',
        priority: 'medium',
        estimatedDuration: 30,
        order: 3,
        content: {
          documents: ['Benefits Overview', 'Leave Policy', 'Code of Conduct', 'Performance Review Process']
        },
        resources: [
          { title: 'Benefits Portal', url: 'https://benefits.zhdconsulting.com' },
          { title: 'HR Contact Info', url: 'https://example.com/hr-contacts' }
        ]
      },
      {
        title: 'Team Introduction & Roles',
        description: 'Meet your team members, understand reporting structure, and schedule 1-on-1 meetings',
        type: 'meeting',
        category: 'team',
        priority: 'medium',
        estimatedDuration: 60,
        requiredDepartment: 'Engineering',
        order: 4,
        content: {
          teamMembers: [
            { name: 'Sarah Chen', role: 'Team Lead', email: 'sarah.chen@zhd.com' },
            { name: 'Mike Rodriguez', role: 'Senior Developer', email: 'mike.r@zhd.com' },
            { name: 'Emily Watson', role: 'UX Designer', email: 'emily.w@zhd.com' }
          ]
        }
      },
      {
        title: 'Technical Setup & Tools',
        description: 'Configure your development environment, access company tools, and set up accounts',
        type: 'hands-on',
        category: 'technical',
        priority: 'high',
        estimatedDuration: 90,
        requiredRole: 'new_hire',
        requiredDepartment: 'Engineering',
        order: 5,
        content: {
          tools: ['Slack', 'Jira', 'GitHub', 'Figma', 'AWS Console'],
          setupSteps: [
            'Install development tools',
            'Configure IDE',
            'Set up version control',
            'Access cloud resources'
          ]
        }
      },
      {
        title: 'First Project Assignment',
        description: 'Review and start your first project with guidance from your team lead',
        type: 'project',
        category: 'project',
        priority: 'low',
        estimatedDuration: 180,
        prerequisites: ['technical-setup'],
        order: 6,
        content: {
          projectName: 'Customer Portal Enhancement',
          description: 'Add new features to the customer portal',
          technologies: ['React', 'Node.js', 'MySQL'],
          timeline: '2 weeks'
        }
      }
    ]

    const createdTasks = []
    for (const taskData of tasks) {
      const task = await OnboardingTask.create(taskData)
      createdTasks.push(task)
    }

    console.log('✅ Onboarding tasks created')

    // Assign tasks to new hire
    const userTasks = []
    for (let i = 0; i < createdTasks.length; i++) {
      const task = createdTasks[i]
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + (i + 1) * 2) // Stagger due dates

      let status = 'not_started'
      let progress = 0
      let startedAt = null
      let completedAt = null

      // Mark first few tasks as completed/in progress for demo
      if (i === 0) {
        status = 'completed'
        progress = 100
        startedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        completedAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      } else if (i === 1) {
        status = 'completed'
        progress = 100
        startedAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        completedAt = new Date()
      } else if (i === 2) {
        status = 'in_progress'
        progress = 75
        startedAt = new Date()
      }

      const userTask = await UserTask.create({
        userId: newHire.id,
        taskId: task.id,
        status,
        progress,
        startedAt,
        completedAt,
        dueDate
      })

      userTasks.push(userTask)
    }

    console.log('✅ User tasks assigned')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📋 Demo Accounts:')
    console.log('HR Admin: hr@zhdconsulting.com / demo123')
    console.log('New Hire: john.doe@zhdconsulting.com / demo123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
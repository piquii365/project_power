import User from './User.js'
import OnboardingTask from './OnboardingTask.js'
import UserTask from './UserTask.js'
import ChatMessage from './ChatMessage.js'
import Analytics from './Analytics.js'

// Define associations
User.hasMany(UserTask, { foreignKey: 'userId', as: 'tasks' })
UserTask.belongsTo(User, { foreignKey: 'userId', as: 'user' })

OnboardingTask.hasMany(UserTask, { foreignKey: 'taskId', as: 'userTasks' })
UserTask.belongsTo(OnboardingTask, { foreignKey: 'taskId', as: 'task' })

User.hasMany(ChatMessage, { foreignKey: 'userId', as: 'chatMessages' })
ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' })

User.hasMany(Analytics, { foreignKey: 'userId', as: 'analytics' })
Analytics.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export {
  User,
  OnboardingTask,
  UserTask,
  ChatMessage,
  Analytics
}
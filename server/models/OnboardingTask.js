import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const OnboardingTask = sequelize.define('OnboardingTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('video', 'document', 'interactive', 'meeting', 'hands-on', 'project'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('company', 'security', 'hr', 'team', 'technical', 'project'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  estimatedDuration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  requiredRole: {
    type: DataTypes.STRING,
    allowNull: true
  },
  requiredDepartment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  prerequisites: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  content: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  resources: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
})

export default OnboardingTask
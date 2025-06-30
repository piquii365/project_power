import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  intent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  context: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  feedback: {
    type: DataTypes.ENUM('helpful', 'not_helpful'),
    allowNull: true
  },
  responseTime: {
    type: DataTypes.INTEGER, // in milliseconds
    allowNull: true
  }
})

export default ChatMessage
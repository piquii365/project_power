import { Sequelize } from 'sequelize'
import "dotenv/config";

const sequelize = new Sequelize(
  process.env.DB_NAME || 'onboarding',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Piquii.365',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  }
)

export default sequelize
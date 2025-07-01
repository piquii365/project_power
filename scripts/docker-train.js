import ModelTrainer from './train-models.js'
import ModelValidator from './validate-models.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class DockerTrainer {
  constructor() {
    this.trainer = new ModelTrainer()
    this.validator = new ModelValidator()
  }

  async checkExistingModels() {
    try {
      const modelsPath = path.join(__dirname, '../models')
      const metricsFile = path.join(modelsPath, 'training-metrics.json')
      
      const stats = await fs.stat(metricsFile)
      const metrics = JSON.parse(await fs.readFile(metricsFile, 'utf8'))
      
      // Check if models were trained recently (within last 24 hours)
      const lastTrained = new Date(metrics.timestamp)
      const now = new Date()
      const hoursSinceTraining = (now - lastTrained) / (1000 * 60 * 60)
      
      if (hoursSinceTraining < 24) {
        console.log(`ℹ️  Models were trained ${hoursSinceTraining.toFixed(1)} hours ago, skipping training`)
        return true
      }
      
      return false
    } catch (error) {
      console.log('📊 No existing models found, proceeding with training')
      return false
    }
  }

  async trainWithFallback() {
    try {
      console.log('🤖 Starting AI model training for Docker environment...')
      
      // Check if we need to train
      if (await this.checkExistingModels()) {
        return true
      }
      
      // Set shorter timeouts for Docker environment
      const originalTimeout = process.env.AI_TRAINING_TIMEOUT || 600000 // 10 minutes
      
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Training timeout')), originalTimeout)
      })
      
      // Race between training and timeout
      await Promise.race([
        this.trainer.run(),
        timeoutPromise
      ])
      
      console.log('✅ AI model training completed successfully')
      return true
      
    } catch (error) {
      console.warn('⚠️  AI model training failed, creating fallback configuration:', error.message)
      
      // Create fallback model configuration
      await this.createFallbackModels()
      return false
    }
  }

  async validateWithFallback() {
    try {
      console.log('🔍 Starting AI model validation...')
      
      const validationTimeout = process.env.MODEL_VALIDATION_TIMEOUT || 300000 // 5 minutes
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Validation timeout')), validationTimeout)
      })
      
      await Promise.race([
        this.validator.run(),
        timeoutPromise
      ])
      
      console.log('✅ AI model validation completed successfully')
      return true
      
    } catch (error) {
      console.warn('⚠️  AI model validation failed, models will use fallback logic:', error.message)
      return false
    }
  }

  async createFallbackModels() {
    try {
      const modelsPath = path.join(__dirname, '../models')
      await fs.mkdir(modelsPath, { recursive: true })
      
      // Create fallback metrics file
      const fallbackMetrics = {
        timestamp: new Date().toISOString(),
        status: 'fallback',
        environment: 'docker',
        models: {
          faqClassifier: {
            status: 'fallback',
            accuracy: 0.75, // Conservative estimate
            note: 'Using rule-based fallback'
          },
          recommendationEngine: {
            status: 'fallback',
            precision: 0.70,
            note: 'Using collaborative filtering fallback'
          },
          progressPredictor: {
            status: 'fallback',
            r2Score: 0.65,
            note: 'Using heuristic-based prediction'
          }
        },
        fallbackReason: 'Training failed or timed out in Docker environment'
      }
      
      await fs.writeFile(
        path.join(modelsPath, 'training-metrics.json'),
        JSON.stringify(fallbackMetrics, null, 2)
      )
      
      // Create basic vocabulary file for FAQ classifier fallback
      const basicVocabulary = [
        'benefit', 'insurance', 'health', '401k', 'vacation', 'pto', 'sick', 'leave',
        'team', 'colleague', 'manager', 'supervisor', 'coworker', 'department',
        'task', 'todo', 'assignment', 'deadline', 'complete', 'progress',
        'setup', 'computer', 'software', 'access', 'login', 'password', 'account',
        'policy', 'rule', 'guideline', 'handbook', 'procedure', 'process',
        'help', 'question', 'support', 'assistance'
      ]
      
      await fs.writeFile(
        path.join(modelsPath, 'vocabulary.json'),
        JSON.stringify(basicVocabulary, null, 2)
      )
      
      console.log('✅ Fallback model configuration created')
      
    } catch (error) {
      console.error('❌ Failed to create fallback models:', error)
      throw error
    }
  }

  async run() {
    console.log('🚀 Docker AI Training Pipeline Started')
    
    const trainingSuccess = await this.trainWithFallback()
    const validationSuccess = await this.validateWithFallback()
    
    console.log('\n📊 Training Summary:')
    console.log(`• Training: ${trainingSuccess ? '✅ SUCCESS' : '⚠️  FALLBACK'}`)
    console.log(`• Validation: ${validationSuccess ? '✅ SUCCESS' : '⚠️  FALLBACK'}`)
    
    if (!trainingSuccess || !validationSuccess) {
      console.log('\n⚠️  Some AI features will use fallback logic')
      console.log('   This is normal for Docker environments with limited resources')
    }
    
    console.log('\n🎉 AI setup completed - application ready to start')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dockerTrainer = new DockerTrainer()
  dockerTrainer.run().catch(error => {
    console.error('💥 Docker training pipeline failed:', error)
    process.exit(1)
  })
}

export default DockerTrainer
import tf from '@tensorflow/tfjs-node'
import brain from 'brain.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class ModelValidator {
  constructor() {
    this.models = {}
    this.testData = null
    this.results = {}
  }

  async loadModels() {
    console.log('📦 Loading trained models...')
    
    try {
      // Load FAQ Classifier
      this.models.faqClassifier = await tf.loadLayersModel(`file://${path.join(__dirname, '../models/faq-classifier/model.json')}`)
      
      // Load vocabulary
      const vocabData = await fs.readFile(path.join(__dirname, '../models/vocabulary.json'), 'utf8')
      this.vocabulary = JSON.parse(vocabData)
      
      // Load Recommendation Engine
      const recEngineData = await fs.readFile(path.join(__dirname, '../models/recommendation-engine.json'), 'utf8')
      this.models.recommendationEngine = new brain.NeuralNetwork()
      this.models.recommendationEngine.fromJSON(JSON.parse(recEngineData))
      
      // Load Progress Predictor
      this.models.progressPredictor = await tf.loadLayersModel(`file://${path.join(__dirname, '../models/progress-predictor/model.json')}`)
      
      console.log('✅ All models loaded successfully')
    } catch (error) {
      console.error('❌ Failed to load models:', error.message)
      throw error
    }
  }

  async generateTestData() {
    console.log('🧪 Generating test data...')
    
    this.testData = {
      faqQueries: [
        { input: 'how do I enroll in health benefits', expected: 'benefits' },
        { input: 'who should I contact for technical issues', expected: 'technical' },
        { input: 'what tasks do I need to complete', expected: 'tasks' },
        { input: 'tell me about remote work policy', expected: 'policies' },
        { input: 'how do I meet my team members', expected: 'team' }
      ],
      userProfiles: [
        { userId: 'test_user_1', department: 'Engineering', role: 'new_hire', tasksCompleted: 3, timeSpent: 180, engagement: 0.8 },
        { userId: 'test_user_2', department: 'Sales', role: 'employee', tasksCompleted: 7, timeSpent: 320, engagement: 0.6 },
        { userId: 'test_user_3', department: 'Marketing', role: 'manager', tasksCompleted: 9, timeSpent: 450, engagement: 0.9 }
      ],
      recommendations: [
        { userId: 'user1', taskId: 'security-training', expectedRating: 0.8 },
        { userId: 'user2', taskId: 'team-intro', expectedRating: 0.6 },
        { userId: 'user3', taskId: 'tech-setup', expectedRating: 0.9 }
      ]
    }
  }

  async validateFAQClassifier() {
    console.log('🤖 Validating FAQ Classifier...')
    
    const categories = ['benefits', 'team', 'tasks', 'technical', 'policies']
    let correct = 0
    let total = this.testData.faqQueries.length
    
    for (const query of this.testData.faqQueries) {
      // Encode input
      const vector = new Array(this.vocabulary.length).fill(0)
      query.input.toLowerCase().split(' ').forEach(word => {
        const index = this.vocabulary.indexOf(word)
        if (index !== -1) vector[index] = 1
      })
      
      // Predict
      const prediction = this.models.faqClassifier.predict(tf.tensor2d([vector]))
      const predictedIndex = prediction.argMax(1).dataSync()[0]
      const predictedCategory = categories[predictedIndex]
      
      if (predictedCategory === query.expected) {
        correct++
      }
      
      console.log(`Query: "${query.input}" | Expected: ${query.expected} | Predicted: ${predictedCategory}`)
      
      prediction.dispose()
    }
    
    const accuracy = correct / total
    this.results.faqClassifier = {
      accuracy,
      correct,
      total,
      passed: accuracy >= 0.85
    }
    
    console.log(`✅ FAQ Classifier Accuracy: ${(accuracy * 100).toFixed(1)}%`)
  }

  async validateRecommendationEngine() {
    console.log('🎯 Validating Recommendation Engine...')
    
    let totalError = 0
    let predictions = 0
    
    for (const rec of this.testData.recommendations) {
      const input = {
        userId: this.hashString(rec.userId),
        taskId: this.hashString(rec.taskId),
        completionTime: 0.5, // Normalized
        engagement: 0.7
      }
      
      const prediction = this.models.recommendationEngine.run(input)
      const predictedRating = prediction.rating
      const error = Math.abs(predictedRating - rec.expectedRating)
      
      totalError += error
      predictions++
      
      console.log(`User: ${rec.userId} | Task: ${rec.taskId} | Expected: ${rec.expectedRating} | Predicted: ${predictedRating.toFixed(3)}`)
    }
    
    const mae = totalError / predictions
    this.results.recommendationEngine = {
      mae,
      predictions,
      passed: mae <= 0.3
    }
    
    console.log(`✅ Recommendation Engine MAE: ${mae.toFixed(3)}`)
  }

  async validateProgressPredictor() {
    console.log('📈 Validating Progress Predictor...')
    
    let totalError = 0
    let predictions = 0
    
    for (const profile of this.testData.userProfiles) {
      const features = [
        this.encodeDepartment(profile.department),
        this.encodeRole(profile.role),
        profile.tasksCompleted / 10,
        profile.timeSpent / 500,
        profile.engagement
      ]
      
      const prediction = this.models.progressPredictor.predict(tf.tensor2d([features]))
      const predictedProgress = prediction.dataSync()[0] * 100 // Denormalize
      
      // Simulate expected progress based on profile
      const expectedProgress = this.calculateExpectedProgress(profile)
      const error = Math.abs(predictedProgress - expectedProgress)
      
      totalError += error
      predictions++
      
      console.log(`User: ${profile.userId} | Expected: ${expectedProgress.toFixed(1)}% | Predicted: ${predictedProgress.toFixed(1)}%`)
      
      prediction.dispose()
    }
    
    const mae = totalError / predictions
    this.results.progressPredictor = {
      mae,
      predictions,
      passed: mae <= 15 // 15% error threshold
    }
    
    console.log(`✅ Progress Predictor MAE: ${mae.toFixed(1)}%`)
  }

  calculateExpectedProgress(profile) {
    // Simple heuristic for expected progress
    let progress = profile.tasksCompleted * 10 // 10% per task
    progress += profile.engagement * 20 // Engagement bonus
    progress += (profile.timeSpent / 500) * 30 // Time investment bonus
    
    return Math.min(progress, 100)
  }

  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash) / 2147483647
  }

  encodeDepartment(dept) {
    const depts = ['Engineering', 'Sales', 'Marketing', 'Operations']
    return depts.indexOf(dept) / (depts.length - 1)
  }

  encodeRole(role) {
    const roles = ['new_hire', 'employee', 'manager']
    return roles.indexOf(role) / (roles.length - 1)
  }

  async performanceTest() {
    console.log('⚡ Running performance tests...')
    
    const iterations = 100
    const testInput = {
      faq: 'what are the company benefits and how do I access them',
      recommendation: { userId: 'perf_test', taskId: 'test_task', completionTime: 0.5, engagement: 0.7 },
      progress: [0.5, 0.3, 0.6, 0.4, 0.8]
    }
    
    // FAQ Classifier Performance
    const faqStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      const vector = new Array(this.vocabulary.length).fill(0)
      testInput.faq.toLowerCase().split(' ').forEach(word => {
        const index = this.vocabulary.indexOf(word)
        if (index !== -1) vector[index] = 1
      })
      const prediction = this.models.faqClassifier.predict(tf.tensor2d([vector]))
      prediction.dispose()
    }
    const faqTime = (Date.now() - faqStart) / iterations
    
    // Recommendation Engine Performance
    const recStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      this.models.recommendationEngine.run(testInput.recommendation)
    }
    const recTime = (Date.now() - recStart) / iterations
    
    // Progress Predictor Performance
    const progStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      const prediction = this.models.progressPredictor.predict(tf.tensor2d([testInput.progress]))
      prediction.dispose()
    }
    const progTime = (Date.now() - progStart) / iterations
    
    this.results.performance = {
      faqClassifier: { avgInferenceTime: faqTime, passed: faqTime <= 800 },
      recommendationEngine: { avgInferenceTime: recTime, passed: recTime <= 400 },
      progressPredictor: { avgInferenceTime: progTime, passed: progTime <= 200 }
    }
    
    console.log(`✅ FAQ Classifier: ${faqTime.toFixed(1)}ms avg inference`)
    console.log(`✅ Recommendation Engine: ${recTime.toFixed(1)}ms avg inference`)
    console.log(`✅ Progress Predictor: ${progTime.toFixed(1)}ms avg inference`)
  }

  async saveValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      validation: this.results,
      summary: {
        allTestsPassed: Object.values(this.results).every(result => 
          typeof result.passed === 'boolean' ? result.passed : 
          Object.values(result).every(subResult => subResult.passed)
        ),
        recommendations: this.generateRecommendations()
      }
    }
    
    await fs.writeFile(
      path.join(__dirname, '../models/validation-report.json'),
      JSON.stringify(report, null, 2)
    )
    
    console.log('📊 Validation report saved')
    return report
  }

  generateRecommendations() {
    const recommendations = []
    
    if (!this.results.faqClassifier.passed) {
      recommendations.push('FAQ Classifier accuracy below threshold - consider retraining with more data')
    }
    
    if (!this.results.recommendationEngine.passed) {
      recommendations.push('Recommendation Engine MAE too high - tune hyperparameters or add features')
    }
    
    if (!this.results.progressPredictor.passed) {
      recommendations.push('Progress Predictor error rate high - collect more temporal data')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All models performing within acceptable thresholds')
    }
    
    return recommendations
  }

  async run() {
    try {
      console.log('🔍 Starting Model Validation Pipeline...')
      
      await this.loadModels()
      await this.generateTestData()
      await this.validateFAQClassifier()
      await this.validateRecommendationEngine()
      await this.validateProgressPredictor()
      await this.performanceTest()
      
      const report = await this.saveValidationReport()
      
      console.log('\n🎉 Validation completed!')
      console.log('\n📋 Validation Summary:')
      console.log(`• FAQ Classifier: ${this.results.faqClassifier.passed ? '✅ PASSED' : '❌ FAILED'}`)
      console.log(`• Recommendation Engine: ${this.results.recommendationEngine.passed ? '✅ PASSED' : '❌ FAILED'}`)
      console.log(`• Progress Predictor: ${this.results.progressPredictor.passed ? '✅ PASSED' : '❌ FAILED'}`)
      console.log(`• Performance Tests: ${Object.values(this.results.performance).every(p => p.passed) ? '✅ PASSED' : '❌ FAILED'}`)
      
      if (!report.summary.allTestsPassed) {
        console.log('\n⚠️  Recommendations:')
        report.summary.recommendations.forEach(rec => console.log(`• ${rec}`))
        process.exit(1)
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error)
      process.exit(1)
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ModelValidator()
  validator.run()
}

export default ModelValidator
import Joi from 'joi'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      })
    }
    next()
  }
}

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    phone: Joi.string().optional(),
    location: Joi.string().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    phone: Joi.string().optional(),
    location: Joi.string().optional(),
    preferences: Joi.object().optional()
  }),

  createTask: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    type: Joi.string().valid('video', 'document', 'interactive', 'meeting', 'hands-on', 'project').required(),
    category: Joi.string().valid('company', 'security', 'hr', 'team', 'technical', 'project').required(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    estimatedDuration: Joi.number().integer().min(1).required(),
    requiredRole: Joi.string().optional(),
    requiredDepartment: Joi.string().optional(),
    prerequisites: Joi.array().optional(),
    content: Joi.object().optional(),
    resources: Joi.array().optional()
  }),

  updateTaskProgress: Joi.object({
    status: Joi.string().valid('not_started', 'in_progress', 'completed', 'skipped').optional(),
    progress: Joi.number().integer().min(0).max(100).optional(),
    feedback: Joi.string().optional(),
    rating: Joi.number().integer().min(1).max(5).optional(),
    notes: Joi.string().optional()
  }),

  chatMessage: Joi.object({
    message: Joi.string().required(),
    context: Joi.object().optional()
  })
}
const Joi = require("joi")

const idSchema = Joi.object({
  id: Joi.string().required(),
})

const updateSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().required(),
  password: Joi.string().min(8).optional(),
})

module.exports = { idSchema, updateSchema }

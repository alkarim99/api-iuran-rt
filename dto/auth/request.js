const Joi = require("joi")

const signUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().required(),
})

const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
})

module.exports = { signUpSchema, signInSchema }

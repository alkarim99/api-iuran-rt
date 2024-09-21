const Joi = require("joi")

const idSchema = Joi.object({
  id: Joi.string().required(),
})

const createSchema = Joi.object({
  nominal: Joi.number().required(),
  transaction_at: Joi.string().required(),
  description: Joi.string().required(),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  nominal: Joi.number().required(),
  transaction_at: Joi.string().required(),
  description: Joi.string().required(),
})

const filterSchema = Joi.object({
  transaction_at: Joi.date(),
  keyword: Joi.string(),
  sort_by: Joi.string(),
  order: Joi.number(),
  page: Joi.number(),
  limit: Joi.number(),
})

module.exports = { idSchema, createSchema, updateSchema, filterSchema }

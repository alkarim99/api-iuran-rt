const Joi = require("joi")

const idSchema = Joi.object({
  id: Joi.string().required(),
})

const createSchema = Joi.object({
  warga_id: Joi.string().required(),
  period_start: Joi.date().required(),
  period_end: Joi.date().required(),
  nominal: Joi.number().required(),
  payment_method: Joi.string().valid("cash", "transfer").required(),
  pay_at: Joi.date().required(),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  warga_id: Joi.string().required(),
  period_start: Joi.date().required(),
  period_end: Joi.date().required(),
  nominal: Joi.number().required(),
  payment_method: Joi.string().valid("cash", "transfer").required(),
  pay_at: Joi.date().required(),
})

const filterSchema = Joi.object({
  pay_at: Joi.date(),
  keyword: Joi.string(),
  payment_method: Joi.string(),
  sort_by: Joi.string(),
  page: Joi.number(),
  limit: Joi.number(),
})

module.exports = { idSchema, createSchema, updateSchema, filterSchema }

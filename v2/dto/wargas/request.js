const Joi = require("joi")

const idSchema = Joi.object({
  id: Joi.string().required(),
})

const createSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  paymentTypeId: Joi.string().required(),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  address: Joi.string().required(),
  paymentTypeId: Joi.string().required(),
})

const filterSchema = Joi.object({
  keyword: Joi.string(),
  sort_by: Joi.string(),
  order: Joi.string(),
  page: Joi.number(),
  limit: Joi.number(),
})

module.exports = { idSchema, createSchema, updateSchema, filterSchema }

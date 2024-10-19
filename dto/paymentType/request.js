const Joi = require("joi")
const { detailsEntity } = require("../../entities/paymentType.entity")

const idSchema = Joi.object({
  id: Joi.string().required(),
})

const createSchema = Joi.object({
  name: Joi.string().required(),
  nominal: Joi.number().required(),
  details: Joi.array().required(),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  nominal: Joi.number().required(),
  details: Joi.array().required(),
})

module.exports = { idSchema, createSchema, updateSchema }

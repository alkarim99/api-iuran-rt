const Joi = require("joi");

const idSchema = Joi.object({
  id: Joi.string().required(),
});

const createSchema = Joi.object({
  nominal: Joi.number().required(),
  transaction_at: Joi.string().required(),
  description: Joi.string().required(),
  payment_method: Joi.string().valid("cash", "transfer").required(),
});

const updateSchema = Joi.object({
  id: Joi.string().required(),
  nominal: Joi.number().required(),
  transaction_at: Joi.string().required(),
  description: Joi.string().required(),
  payment_method: Joi.string().valid("cash", "transfer").required(),
});

const filterSchema = Joi.object({
  payAt: Joi.string().allow("").optional(),
  keyword: Joi.string().allow("").optional(),
  sort_by: Joi.string().allow("").optional(),
  order: Joi.number(),
  page: Joi.number(),
  limit: Joi.number(),
}).unknown(true);

module.exports = { idSchema, createSchema, updateSchema, filterSchema };

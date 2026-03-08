const Joi = require("joi");

const idSchema = Joi.object({
  id: Joi.string().required(),
});

const createSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
});

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  address: Joi.string().required(),
});

const filterSchema = Joi.object({
  keyword: Joi.string().allow("").optional(),
  sort_by: Joi.string().allow("").optional(),
  order: Joi.number().optional(),
  page: Joi.number().optional(),
  limit: Joi.number().optional(),
}).unknown(true);

module.exports = { idSchema, createSchema, updateSchema, filterSchema };

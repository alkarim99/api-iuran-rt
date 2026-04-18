const Joi = require("joi");

const filterSchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2100).required(),
  type: Joi.string().valid("petty_cash", "rekening").optional(),
});

const upsertSchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2100).required(),
  type: Joi.string().valid("petty_cash", "rekening").required(),
  nominal: Joi.number().min(0).required(),
  note: Joi.string().max(255).allow("").optional(),
});

const deleteSchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2100).required(),
  type: Joi.string().valid("petty_cash", "rekening").required(),
});

module.exports = { filterSchema, upsertSchema, deleteSchema };

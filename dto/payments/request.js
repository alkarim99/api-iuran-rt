const Joi = require("joi");

const idSchema = Joi.object({
  id: Joi.string().required(),
});

const createSchema = Joi.object({
  warga_id: Joi.string().required(),
  period_start: Joi.date().required(),
  period_end: Joi.date().required(),
  nominal: Joi.number().required(),
  payment_method: Joi.string().valid("cash", "transfer").required(),
  pay_at: Joi.date().required(),
});

const updateSchema = Joi.object({
  id: Joi.string().required(),
  warga_id: Joi.string().required(),
  period_start: Joi.date().required(),
  period_end: Joi.date().required(),
  nominal: Joi.number().required(),
  payment_method: Joi.string().valid("cash", "transfer").required(),
  pay_at: Joi.date().required(),
});

const filterSchema = Joi.object({
  pay_at: Joi.date(),
  keyword: Joi.string(),
  payment_method: Joi.string(),
  sort_by: Joi.string(),
  order: Joi.number(),
  page: Joi.number(),
  limit: Joi.number(),
}).unknown(true);

const reportRangeSchema = Joi.object({
  // Format: YYYY-MM-DD, contoh: 2025-01-01
  start_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "start_date harus berformat YYYY-MM-DD, contoh: 2025-01-01",
      "any.required": "start_date wajib diisi",
    }),
  end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "end_date harus berformat YYYY-MM-DD, contoh: 2025-12-31",
      "any.required": "end_date wajib diisi",
    }),
});

module.exports = { idSchema, createSchema, updateSchema, filterSchema, reportRangeSchema };

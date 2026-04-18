const Joi = require("joi");

const yearSchema = Joi.object({
  year: Joi.number().integer().min(1000).max(9999).required().messages({
    "number.base": "year harus berupa angka",
    "number.integer": "year harus berupa bilangan bulat",
    "number.min": "year tidak valid",
    "number.max": "year tidak valid",
    "any.required": "year wajib diisi",
  }),
});

const monthSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "month harus berformat YYYY-MM, contoh: 2025-06",
      "any.required": "month wajib diisi",
    }),
});

// Digunakan untuk kas-summary: year di-extract dari month (YYYY-MM)
const kasSummarySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "month harus berformat YYYY-MM, contoh: 2025-06",
      "any.required": "month wajib diisi",
    }),
});

// Digunakan untuk tier-breakdown: year di-extract dari month (YYYY-MM).
// month opsional — jika tidak diisi, default ke bulan saat ini di controller.
const tierBreakdownSchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .optional()
    .messages({
      "string.pattern.base": "month harus berformat YYYY-MM, contoh: 2025-06",
    }),
});

module.exports = {
  yearSchema,
  monthSchema,
  kasSummarySchema,
  tierBreakdownSchema,
};

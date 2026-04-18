/**
 * Test Helper — Shared utilities for integration tests.
 * Provides: admin token generation, database cleanup, app import.
 */
const jwt = require("jsonwebtoken");

/**
 * Generate a valid JWT token for testing authenticated endpoints.
 * @param {Object} overrides - Override default user payload fields
 * @returns {string} Bearer token string
 */
const getAdminToken = (overrides = {}) => {
  const payload = {
    _id: "000000000000000000000001",
    name: "Test Admin",
    email: "admin@test.com",
    role: "admin",
    ...overrides,
  };
  const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
};

/**
 * Generate a token for a non-admin user.
 */
const getUserToken = (overrides = {}) => {
  return getAdminToken({ role: "user", ...overrides });
};

/**
 * Clean all test collections between tests.
 */
const cleanDatabase = async () => {
  const {
    collUser,
    collWarga,
    collPayment,
    collExpense,
    collPaymentType,
  } = require("../config/database");
  await Promise.all([
    collUser.deleteMany({}),
    collWarga.deleteMany({}),
    collPayment.deleteMany({}),
    collExpense.deleteMany({}),
    collPaymentType.deleteMany({}),
  ]);
};

module.exports = {
  getAdminToken,
  getUserToken,
  cleanDatabase,
};

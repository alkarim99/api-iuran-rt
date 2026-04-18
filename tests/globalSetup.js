/**
 * Global Setup — Start MongoMemoryServer before all tests.
 * The URI is stored in a global variable for use in test files.
 */
const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async () => {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Store for globalTeardown and test files
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = "test";
  process.env.JWT_PRIVATE_KEY = "test-secret-key-for-jwt";

  // Use test database names
  process.env.DB_DEV_NAME_PAYMENT = "test_payment";
  process.env.DB_DEV_COLLECTION_PAYMENT = "payments";
  process.env.DB_DEV_COLLECTION_EXPENSE = "expenses";
  process.env.DB_DEV_COLLECTION_PAYMENT_TYPE = "payment_types";
  process.env.DB_DEV_NAME_USER = "test_user";
  process.env.DB_DEV_COLLECTION_USER = "users";
  process.env.DB_DEV_NAME_WARGA = "test_warga";
  process.env.DB_DEV_COLLECTION_WARGA = "wargas";

  // Set LIVE to same as DEV for test environment
  process.env.DB_LIVE_NAME_PAYMENT = "test_payment";
  process.env.DB_LIVE_COLLECTION_PAYMENT = "payments";
  process.env.DB_LIVE_COLLECTION_EXPENSE = "expenses";
  process.env.DB_LIVE_COLLECTION_PAYMENT_TYPE = "payment_types";
  process.env.DB_LIVE_NAME_USER = "test_user";
  process.env.DB_LIVE_COLLECTION_USER = "users";
  process.env.DB_LIVE_NAME_WARGA = "test_warga";
  process.env.DB_LIVE_COLLECTION_WARGA = "wargas";
};

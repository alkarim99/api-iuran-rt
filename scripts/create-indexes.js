/**
 * MongoDB Index Creation Script
 *
 * Run this script once to create indexes that improve query performance.
 * Usage: node scripts/create-indexes.js
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");

async function createIndexes() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Determine environment
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local";

    const dbPayment = isDev
      ? process.env.DB_DEV_NAME_PAYMENT
      : process.env.DB_LIVE_NAME_PAYMENT;
    const collPayment = isDev
      ? process.env.DB_DEV_COLLECTION_PAYMENT
      : process.env.DB_LIVE_COLLECTION_PAYMENT;
    const dbWarga = isDev
      ? process.env.DB_DEV_NAME_WARGA
      : process.env.DB_LIVE_NAME_WARGA;
    const collWarga = isDev
      ? process.env.DB_DEV_COLLECTION_WARGA
      : process.env.DB_LIVE_COLLECTION_WARGA;

    // Payment indexes
    const payments = client.db(dbPayment).collection(collPayment);
    await payments.createIndex({ "warga.name": 1, "warga.address": 1 });
    console.log("✓ Created index: payments(warga.name, warga.address)");

    await payments.createIndex({ pay_at: 1 });
    console.log("✓ Created index: payments(pay_at)");

    await payments.createIndex({ "warga._id": 1 });
    console.log("✓ Created index: payments(warga._id)");

    // Warga indexes
    const wargas = client.db(dbWarga).collection(collWarga);
    await wargas.createIndex({ name: 1, address: 1 });
    console.log("✓ Created index: wargas(name, address)");

    console.log("\nAll indexes created successfully!");
  } catch (err) {
    console.error("Error creating indexes:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes();

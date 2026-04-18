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
    console.log("Connected to MongoDB\n");

    // Determine environment
    const isDev =
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "local";

    const dbPayment = isDev
      ? process.env.DB_DEV_NAME_PAYMENT
      : process.env.DB_LIVE_NAME_PAYMENT;
    const collPaymentName = isDev
      ? process.env.DB_DEV_COLLECTION_PAYMENT
      : process.env.DB_LIVE_COLLECTION_PAYMENT;
    const collExpenseName = isDev
      ? process.env.DB_DEV_COLLECTION_EXPENSE
      : process.env.DB_LIVE_COLLECTION_EXPENSE;
    const collOtherIncomeName =
      (isDev
        ? process.env.DB_DEV_COLLECTION_OTHER_INCOME
        : process.env.DB_LIVE_COLLECTION_OTHER_INCOME) || "other_income";
    const collOpeningBalanceName =
      (isDev
        ? process.env.DB_DEV_COLLECTION_OPENING_BALANCE
        : process.env.DB_LIVE_COLLECTION_OPENING_BALANCE) || "opening_balances";

    const dbWarga = isDev
      ? process.env.DB_DEV_NAME_WARGA
      : process.env.DB_LIVE_NAME_WARGA;
    const collWargaName = isDev
      ? process.env.DB_DEV_COLLECTION_WARGA
      : process.env.DB_LIVE_COLLECTION_WARGA;

    // ─────────────────────────────────────────────────────────────────────────
    // Collection: payments
    // ─────────────────────────────────────────────────────────────────────────
    const payments = client.db(dbPayment).collection(collPaymentName);

    // [Existing] Pencarian & sorting by nama/alamat warga
    await payments.createIndex({ "warga.name": 1, "warga.address": 1 });
    console.log("✓ payments(warga.name, warga.address)");

    // [Existing] Filter by pay_at (laporan & summary)
    await payments.createIndex({ pay_at: 1 });
    console.log("✓ payments(pay_at)");

    // [Existing] Lookup history pembayaran per warga
    await payments.createIndex({ "warga._id": 1 });
    console.log("✓ payments(warga._id)");

    // [NEW] Compound index untuk pay_at + payment_method
    // → Dipakai: monthly-summary & kas-summary
    //   ($match pay_at date range + $group by payment_method)
    await payments.createIndex({ pay_at: 1, payment_method: 1 });
    console.log("✓ payments(pay_at, payment_method)  [NEW]");

    // [NEW] Compound index untuk range periode + warga._id (covered index)
    // → Dipakai: tunggakan, payment-heatmap, tier-breakdown
    //   Query: period_start <= X <= period_end, distinct warga._id
    //   warga._id disertakan agar query distinct bisa fully covered
    await payments.createIndex({
      period_start: 1,
      period_end: 1,
      "warga._id": 1,
    });
    console.log("✓ payments(period_start, period_end, warga._id)  [NEW]");

    // [NEW] Compound index untuk batch lookup last payment per warga
    // → Dipakai: getTunggakan — $match by warga._id + $sort period_end DESC
    await payments.createIndex({ "warga._id": 1, period_end: -1 });
    console.log("✓ payments(warga._id, period_end DESC)  [NEW]");

    // ─────────────────────────────────────────────────────────────────────────
    // Collection: expenses
    // ─────────────────────────────────────────────────────────────────────────
    const expenses = client.db(dbPayment).collection(collExpenseName);

    // [NEW] Filter by transaction_at date range
    // → Dipakai: monthly-summary & kas-summary
    await expenses.createIndex({ transaction_at: 1 });
    console.log("✓ expenses(transaction_at)  [NEW]");

    // ─────────────────────────────────────────────────────────────────────────
    // Collection: other_income
    // ─────────────────────────────────────────────────────────────────────────
    const otherIncome = client.db(dbPayment).collection(collOtherIncomeName);

    // [NEW] Compound index untuk date range + payment_method
    // → Dipakai: kas-summary
    //   ($match transaction_at range + $group by payment_method)
    await otherIncome.createIndex({ transaction_at: 1, payment_method: 1 });
    console.log("✓ other_income(transaction_at, payment_method)  [NEW]");

    // ─────────────────────────────────────────────────────────────────────────
    // Collection: opening_balances
    // ─────────────────────────────────────────────────────────────────────────
    const openingBalance = client
      .db(dbPayment)
      .collection(collOpeningBalanceName);

    // [NEW] Compound unique index untuk findOne({ year, type })
    // → Dipakai: kas-summary — saldo awal per tahun & tipe kas
    await openingBalance.createIndex({ year: 1, type: 1 }, { unique: true });
    console.log("✓ opening_balances(year, type) [unique]  [NEW]");

    // ─────────────────────────────────────────────────────────────────────────
    // Collection: wargas
    // ─────────────────────────────────────────────────────────────────────────
    const wargas = client.db(dbWarga).collection(collWargaName);

    // [Existing] Sorting & pencarian warga
    await wargas.createIndex({ name: 1, address: 1 });
    console.log("✓ wargas(name, address)");

    console.log("\n✅ All indexes created successfully!");
    console.log("\nIndex mapping per dashboard endpoint:");
    console.log("  /tunggakan        → payments(period_start,period_end,warga._id), payments(warga._id,period_end)");
    console.log("  /monthly-summary  → payments(pay_at,payment_method), expenses(transaction_at)");
    console.log("  /payment-heatmap  → payments(period_start,period_end,warga._id)");
    console.log("  /tier-breakdown   → payments(period_start,period_end,warga._id)");
    console.log("  /kas-summary      → payments(pay_at,payment_method), other_income(transaction_at,payment_method), opening_balances(year,type)");
  } catch (err) {
    console.error("Error creating indexes:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes();

const { MongoClient } = require("mongodb");
// update
let dbPayment = process.env.DB_LIVE_NAME_PAYMENT;
let collectionPayment = process.env.DB_LIVE_COLLECTION_PAYMENT;
let collectionExpense = process.env.DB_LIVE_COLLECTION_EXPENSE;
let collectionExpenseV2 =
  process.env.DB_LIVE_COLLECTION_EXPENSE_V2 || collectionExpense + "_v2";
let collectionOtherIncome =
  process.env.DB_LIVE_COLLECTION_OTHER_INCOME || "other_income";
let collectionOpeningBalance =
  process.env.DB_LIVE_COLLECTION_OPENING_BALANCE || "opening_balances";
let collectionPaymentsType = process.env.DB_LIVE_COLLECTION_PAYMENT_TYPE;
let collectionActivityLogs =
  process.env.DB_LIVE_COLLECTION_ACTIVITY_LOGS || "activity_logs";

let dbUser = process.env.DB_LIVE_NAME_USER;
let collectionUser = process.env.DB_LIVE_COLLECTION_USER;

let dbWarga = process.env.DB_LIVE_NAME_WARGA;
let collectionWarga = process.env.DB_LIVE_COLLECTION_WARGA;

if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "local") {
  dbPayment = process.env.DB_DEV_NAME_PAYMENT;
  collectionPayment = process.env.DB_DEV_COLLECTION_PAYMENT;
  collectionExpense = process.env.DB_DEV_COLLECTION_EXPENSE;
  collectionExpenseV2 =
    process.env.DB_DEV_COLLECTION_EXPENSE_V2 || collectionExpense + "_v2";
  collectionOtherIncome =
    process.env.DB_DEV_COLLECTION_OTHER_INCOME || "other_income";
  collectionOpeningBalance =
    process.env.DB_DEV_COLLECTION_OPENING_BALANCE || "opening_balances";
  collectionPaymentsType = process.env.DB_DEV_COLLECTION_PAYMENT_TYPE;
  collectionActivityLogs =
    process.env.DB_DEV_COLLECTION_ACTIVITY_LOGS || "activity_logs";

  dbUser = process.env.DB_DEV_NAME_USER;
  collectionUser = process.env.DB_DEV_COLLECTION_USER;

  dbWarga = process.env.DB_DEV_NAME_WARGA;
  collectionWarga = process.env.DB_DEV_COLLECTION_WARGA;
}

// const client = new MongoClient(process.env.DB_URI)
const client = new MongoClient(process.env.MONGODB_URI);
const collPayment = client.db(dbPayment).collection(collectionPayment);
const collExpense = client.db(dbPayment).collection(collectionExpense);
const collExpenseV2 = client.db(dbPayment).collection(collectionExpenseV2);
const collOtherIncome = client.db(dbPayment).collection(collectionOtherIncome);
const collOpeningBalance = client.db(dbPayment).collection(collectionOpeningBalance);
const collPaymentType = client.db(dbPayment).collection(collectionPaymentsType);
const collActivityLogs = client
  .db(dbPayment)
  .collection(collectionActivityLogs);
const collUser = client.db(dbUser).collection(collectionUser);
const collActivityLogsUser = client
  .db(dbUser)
  .collection(collectionActivityLogs);
const collWarga = client.db(dbWarga).collection(collectionWarga);
const collActivityLogsWarga = client
  .db(dbWarga)
  .collection(collectionActivityLogs);

client.connect();

module.exports = {
  collPayment,
  collExpense,
  collExpenseV2,
  collOtherIncome,
  collOpeningBalance,
  collPaymentType,
  collActivityLogs,
  collUser,
  collActivityLogsUser,
  collWarga,
  collActivityLogsWarga,
};

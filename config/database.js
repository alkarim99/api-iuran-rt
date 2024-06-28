const { MongoClient } = require("mongodb")

let dbPayment = process.env.DB_LIVE_NAME_PAYMENT
let collectionPayment = process.env.DB_LIVE_COLLECTION_PAYMENT
let collectionPaymentsType = process.env.DB_LIVE_COLLECTION_PAYMENT_TYPE

let dbUser = process.env.DB_LIVE_NAME_USER
let collectionUser = process.env.DB_LIVE_COLLECTION_USER

let dbWarga = process.env.DB_LIVE_NAME_WARGA
let collectionWarga = process.env.DB_LIVE_COLLECTION_WARGA

if (process.env.NODE_ENV == "development") {
  dbPayment = process.env.DB_DEV_NAME_PAYMENT
  collectionPayment = process.env.DB_DEV_COLLECTION_PAYMENT
  collectionPaymentsType = process.env.DB_DEV_COLLECTION_PAYMENT_TYPE

  dbUser = process.env.DB_DEV_NAME_USER
  collectionUser = process.env.DB_DEV_COLLECTION_USER

  dbWarga = process.env.DB_DEV_NAME_WARGA
  collectionWarga = process.env.DB_DEV_COLLECTION_WARGA
}

// const client = new MongoClient(process.env.DB_URI)
const client = new MongoClient(process.env.MONGODB_URI)
const collPayment = client.db(dbPayment).collection(collectionPayment)
const collPaymentType = client.db(dbPayment).collection(collectionPaymentsType)
const collUser = client.db(dbUser).collection(collectionUser)
const collWarga = client.db(dbWarga).collection(collectionWarga)

client.connect()

module.exports = {
  collPayment,
  collPaymentType,
  collUser,
  collWarga,
}

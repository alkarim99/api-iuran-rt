const { MongoClient } = require("mongodb")

const client = new MongoClient(process.env.DB_URI)
const collectionPayment = client.db("Iuran-DB").collection("payments")
const collectionReport = client.db("Iuran-DB").collection("reports")
const collectionWarga = client.db("Warga-DB").collection("wargas")

module.exports = { client, collectionPayment, collectionReport, collectionWarga }

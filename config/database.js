const { MongoClient } = require("mongodb")

const client = new MongoClient(process.env.DB_URI)
const collectionPayment = client.db("Iuran-DB").collection("payments")
const collectionIuran = client.db("Iuran-DB").collection("iurans")
const collectionWarga = client.db("Warga-DB").collection("wargas")

module.exports = {
  client,
  collectionPayment,
  collectionIuran,
  collectionWarga,
}

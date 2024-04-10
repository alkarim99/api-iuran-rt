const { MongoClient } = require("mongodb")

const client = new MongoClient(process.env.DB_URI)
const collectionPayment = client.db("Iuran-DB").collection("payments")
const collectionUser = client.db("User-DB").collection("user")
const collectionWarga = client.db("Warga-DB").collection("wargas")

module.exports = {
  client,
  collectionPayment,
  collectionUser,
  collectionWarga,
}

const { MongoClient } = require("mongodb")

// const client = new MongoClient(
//   "mongodb+srv://abdullahalkarimamrullah01:fU4X5ttWwD6ArDpD@clusteriuranrt.at1v5e4.mongodb.net/?retryWrites=true&w=majority"
// )
// const client = new MongoClient(process.env.DB_URI)
const client = new MongoClient(process.env.MONGODB_URI)
const collectionPayment = client.db("Iuran-DB").collection("payments")
const collectionUser = client.db("User-DB").collection("user")
const collectionWarga = client.db("Warga-DB").collection("wargas")

module.exports = {
  client,
  collectionPayment,
  collectionUser,
  collectionWarga,
}

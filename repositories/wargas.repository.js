const { client, collectionWarga } = require("../config/database")

const getAll = async () => {
  try {
    await client.connect()
    const data = await collectionWarga.find({}).toArray()
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err 
  } finally {
    client.close()
  }
}

module.exports = { getAll }

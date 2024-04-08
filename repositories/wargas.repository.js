const { ObjectId } = require("mongodb")
const { client, collectionWarga } = require("../config/database")
const entity = require("../entities/warga.entity")

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

const getByID = async (id) => {
  try {
    await client.connect()
    const data = await collectionWarga.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    client.close()
  }
}

const create = async (data) => {
  try {
    const warga = entity.wargaEntity(data)
    const result = await collectionWarga.insertOne(warga)
    return result.insertedId
  } catch (err) {
    console.error("Error creating warga:", err)
    throw err
  }
}

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        name: data?.name,
        address: data?.address,
        updated_at: new Date(),
      },
    }
    const result = await collectionWarga.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData
    )
    return result.modifiedCount > 0
  } catch (err) {
    console.error("Error updating warga:", err)
    throw err
  }
}

const deleteWarga = async (id) => {
  try {
    const result = await collectionWarga.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting warga:", err)
    throw err
  }
}

module.exports = { getAll, getByID, create, update, deleteWarga }

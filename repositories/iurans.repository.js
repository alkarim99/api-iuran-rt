const { ObjectId } = require("mongodb")
const { client, collectionIuran } = require("../config/database")
const entity = require("../entities/iuran.entity")

const getAll = async () => {
  try {
    await client.connect()
    const data = await collectionIuran.find({}).toArray()
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
    const data = await collectionIuran.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    client.close()
  }
}

const getLatestPeriodByWargaID = async (id) => {
  try {
    await client.connect()
    const data = await collectionIuran.findOne(
      { warga_id: new ObjectId(id) },
      { sort: { pay_at: -1, period: -1 } },
      {
        projection: { period: 1, _id: 0 }, // Include only the nominal field
      }
    )
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
    const iuran = entity.iuranEntity(data)
    const result = await collectionIuran.insertOne(iuran)
    return result.insertedId
  } catch (err) {
    console.error("Error creating iuran:", err)
    throw err
  }
}

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        warga_id: data?.warga_id,
        payment_id: data?.payment_id,
        period: data?.period,
        nominal: data?.nominal,
        pay_at: data?.pay_at,
        updated_at: new Date(),
      },
    }
    const result = await collectionIuran.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData
    )
    return result.modifiedCount > 0
  } catch (err) {
    console.error("Error updating iuran:", err)
    throw err
  }
}

const deleteIuran = async (id) => {
  try {
    const result = await collectionIuran.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting iuran:", err)
    throw err
  }
}

module.exports = {
  getAll,
  getByID,
  getLatestPeriodByWargaID,
  create,
  update,
  deleteIuran,
}

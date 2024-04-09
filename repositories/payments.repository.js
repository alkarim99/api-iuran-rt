const { ObjectId } = require("mongodb")
const { client, collectionPayment } = require("../config/database")
const entity = require("../entities/payment.entity")

const getAll = async () => {
  try {
    await client.connect()
    const data = await collectionPayment.find({}).toArray()
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
    const data = await collectionPayment.findOne({ _id: new ObjectId(id) })
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
    const payment = entity.paymentEntity(data)
    const result = await collectionPayment.insertOne(payment)
    return result.insertedId
  } catch (err) {
    console.error("Error creating payment:", err)
    throw err
  }
}

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        warga_id: data?.warga_id,
        period_start: new Date(data?.period_start),
        period_end: new Date(data?.period_end),
        number_of_period: data?.number_of_period,
        nominal: data?.nominal,
        payment_method: data?.payment_method,
        updated_at: new Date(),
      },
    }
    const result = await collectionPayment.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData
    )
    return result.modifiedCount > 0
  } catch (err) {
    console.error("Error updating payment:", err)
    throw err
  }
}

const deletePayment = async (id) => {
  try {
    const result = await collectionPayment.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting payment:", err)
    throw err
  }
}

module.exports = {
  getAll,
  getByID,
  create,
  update,
  deletePayment,
}

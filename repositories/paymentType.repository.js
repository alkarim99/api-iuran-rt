const { ObjectId } = require("mongodb")
const { collPaymentType } = require("../config/database")
const entity = require("../entities/paymentType.entity")

const getAll = async () => {
  try {
    const data = await collPaymentType.find({}).toArray()

    return data
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err)
    throw err
  }
}

const getByID = async (id) => {
  try {
    const data = await collPaymentType.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const create = async (data) => {
  try {
    const result = await collPaymentType.insertOne(data)
    return result.insertedId
  } catch (err) {
    console.error("Error creating payment type:", err)
    throw err
  }
}

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        name: data?.name,
        details: data?.details,
        updated_at: new Date(),
      },
    }
    const result = await collPaymentType.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData
    )
    return result.modifiedCount > 0
  } catch (err) {
    console.error("Error updating payment type:", err)
    throw err
  }
}

const deletePaymentType = async (id) => {
  try {
    const result = await collPaymentType.deleteOne({
      _id: new ObjectId(id),
    })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting payment type:", err)
    throw err
  }
}

module.exports = {
  getAll,
  getByID,
  create,
  update,
  deletePaymentType,
}

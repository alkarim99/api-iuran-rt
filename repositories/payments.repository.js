const { ObjectId } = require("mongodb")
const {
  client,
  collectionPayment,
  collectionWarga,
} = require("../config/database")
const entity = require("../entities/payment.entity")

const getAll = async (keyword, sort_by) => {
  try {
    await client.connect()
    let data, keywordRegex
    if (keyword) {
      keywordRegex = new RegExp(keyword, "i")
    }
    if (keyword && sort_by) {
      data = await collectionPayment
        .find({
          $or: [
            { "warga.name": keywordRegex },
            { "warga.address": keywordRegex },
          ],
        })
        .sort({ [sort_by]: 1 })
        .toArray()
    } else if (keyword) {
      data = await collectionPayment
        .find({
          $or: [
            { "warga.name": keywordRegex },
            { "warga.address": keywordRegex },
          ],
        })
        .toArray()
    } else if (sort_by) {
      data = await collectionPayment
        .find({})
        .sort({ [sort_by]: -1 })
        .toArray()
    } else {
      data = await collectionPayment.find({}).toArray()
    }
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

const getByWargaID = async (id) => {
  try {
    await client.connect()
    const data = await collectionPayment
      .find({ "warga._id": new ObjectId(id) })
      .toArray()
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    client.close()
  }
}

const getTotalIncome = async (start, end) => {
  try {
    await client.connect()
    const data = await collectionPayment
      .find(
        {
          pay_at: { $gte: new Date(start), $lte: new Date(end) },
        },
        {
          projection: { nominal: 1, _id: 0 }, // Include only the nominal field
        }
      )
      .toArray()
    let totalIncome = 0
    data.forEach((payment) => {
      totalIncome += parseInt(payment.nominal)
    })
    return totalIncome
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
    const data = await collectionPayment.findOne(
      { "warga._id": new ObjectId(id) },
      { sort: { pay_at: -1 }, projection: { period_end: 1, _id: 0 } }
    )
    return data?.period_end
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    client.close()
  }
}

const create = async (data) => {
  try {
    await client.connect()
    const dataWarga = await collectionWarga.findOne({
      _id: new ObjectId(data?.warga_id),
    })
    data.warga = {
      _id: dataWarga?._id,
      name: dataWarga?.name,
      address: dataWarga?.address,
    }
    const payment = entity.paymentEntity(data)
    const result = await collectionPayment.insertOne(payment)
    return result.insertedId
  } catch (err) {
    console.error("Error creating payment:", err)
    throw err
  } finally {
    client.close()
  }
}

const update = async (data) => {
  try {
    await client.connect()
    const dataWarga = await collectionWarga.findOne({
      _id: new ObjectId(data?.warga_id),
    })
    const updateData = {
      $set: {
        warga: {
          _id: dataWarga?._id,
          name: dataWarga?.name,
          address: dataWarga?.address,
        },
        period_start: new Date(data?.period_start),
        period_end: new Date(data?.period_end),
        number_of_period: data?.number_of_period,
        nominal: data?.nominal,
        payment_method: data?.payment_method,
        pay_at: data?.pay_at,
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
  } finally {
    client.close()
  }
}

const deletePayment = async (id) => {
  try {
    await client.connect()
    const result = await collectionPayment.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting payment:", err)
    throw err
  } finally {
    client.close()
  }
}

module.exports = {
  getAll,
  getByID,
  getByWargaID,
  getTotalIncome,
  getLatestPeriodByWargaID,
  create,
  update,
  deletePayment,
}

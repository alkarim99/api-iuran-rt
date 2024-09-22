const { ObjectId } = require("mongodb")
const { collPayment, collWarga } = require("../config/database")

const getAll = async (keyword, sort_by, page = 1, limit = 20) => {
  try {
    let query = {}
    let options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    }

    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i")
      query["$or"] = [
        { "warga.name": keywordRegex },
        { "warga.address": keywordRegex },
      ]
    }

    let sort = {}
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1
      options.sort = sort
    }

    const data = await collPayment.find(query, options).toArray()
    const totalItems = await collPayment.countDocuments(query)
    const totalPages = Math.ceil(totalItems / limit)

    const response = {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalCount: totalItems,
      perPage: parseInt(limit),
      data: data,
    }

    return response
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err)
    throw err
  }
}

const getByPayAt = async (
  firstDay,
  lastDay,
  keyword,
  sort_by,
  page = 1,
  limit = 20
) => {
  try {
    let query = {}
    let options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    }

    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i")
      query["$or"] = [
        { "warga.name": keywordRegex },
        { "warga.address": keywordRegex },
      ]
    }
    query["$and"] = [{ pay_at: { $gte: firstDay, $lte: lastDay } }]

    let sort = {}
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1
      options.sort = sort
    }

    const data = await collPayment.find(query, options).toArray()
    const totalItems = await collPayment.countDocuments(query)
    const totalPages = Math.ceil(totalItems / limit)

    const response = {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalCount: totalItems,
      perPage: parseInt(limit),
      data: data,
    }

    return response
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err)
    throw err
  }
}

const getByID = async (id) => {
  try {
    const data = await collPayment.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getByWargaID = async (id, sort_by) => {
  try {
    // await client.connect()
    let options = {}

    let sort = {}
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1
      options.sort = sort
    }
    const data = await collPayment
      .find({ "warga._id": new ObjectId(id) }, options)
      .toArray()
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getTotalIncome = async (start, end, sort_by, page = 1, limit = 20) => {
  try {
    let query = {
      pay_at: { $gte: new Date(start), $lte: new Date(end) },
    }
    let options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    }

    let sort = {}
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1
      options.sort = sort
    }

    const data = await collPayment.find(query, options).toArray()
    const totalItems = await collPayment.countDocuments(query)
    const totalPages = Math.ceil(totalItems / limit)
    let totalIncome = 0
    data.forEach((payment) => {
      totalIncome += parseInt(payment.nominal)
    })

    const response = {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalCount: totalItems,
      perPage: parseInt(limit),
      totalIncome,
      data: data,
    }

    return response
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getLatestPeriodByWargaID = async (id) => {
  try {
    const data = await collPayment.findOne(
      { "warga._id": new ObjectId(id) },
      { sort: { pay_at: -1 }, projection: { period_end: 1, _id: 0 } }
    )
    return data?.period_end
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getByPaymentMethod = async (
  firstDay,
  lastDay,
  paymentMethod
) => {
  try {
    let query = {}

    query["$and"] = [
      { pay_at: { $gte: firstDay, $lte: lastDay } },
      {
        payment_method: paymentMethod,
      },
    ]

    const data = await collPayment.find(query).toArray()
    const totalItems = await collPayment.countDocuments(query)

    const response = {
      totalCount: totalItems,
      data: data,
    }

    return response
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const create = async (data) => {
  try {
    const result = await collPayment.insertOne(data)
    return result.insertedId
  } catch (err) {
    console.error("Error creating payment:", err)
    throw err
  }
}

const update = async (data) => {
  try {
    const dataWarga = await collWarga.findOne({
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
        pay_at: new Date(data?.pay_at),
        details_payment: data?.details_payment,
        updated_at: new Date(),
      },
    }
    const result = await collPayment.updateOne(
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
    const result = await collPayment.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting payment:", err)
    throw err
  }
}

module.exports = {
  getAll,
  getByPayAt,
  getByID,
  getByWargaID,
  getByPaymentMethod,
  getTotalIncome,
  getLatestPeriodByWargaID,
  create,
  update,
  deletePayment,
}

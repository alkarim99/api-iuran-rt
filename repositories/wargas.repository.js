const { ObjectId } = require("mongodb")
const { collWarga } = require("../config/database")

const getAllOption = async () => {
  try {
    const data = await collWarga.find({}).toArray()

    return data
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err)
    throw err
  }
}

const getAll = async (keyword, sort_by, order = 1, page = 1, limit = 20) => {
  try {
    let query = {}
    let options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    }

    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i")
      query["$or"] = [{ name: keywordRegex }, { address: keywordRegex }]
    }

    let sort = {}
    if (sort_by) {
      sort[sort_by] = order === -1 ? -1 : 1
      options.sort = sort
    } else {
      sort = { address: 1 }
      options.sort = sort
    }

    const data = await collWarga.find(query, options).toArray()
    const totalItems = await collWarga.countDocuments(query)
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
    const data = await collWarga.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const isAddressDuplicate = async (id, address) => {
  try {
    const query = { address }
    if (id) {
      query._id = { $ne: new ObjectId(id) } // Exclude the current warga ID when checking for duplicates during update
    }
    const existingWarga = await collWarga.findOne(query)
    return !!existingWarga
  } catch (err) {
    console.error("Error checking duplicate address:", err)
    throw err
  }
}

const create = async (data) => {
  try {
    const result = await collWarga.insertOne(data)
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
    const result = await collWarga.updateOne(
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
    const result = await collWarga.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting warga:", err)
    throw err
  }
}

module.exports = {
  getAllOption,
  getAll,
  getByID,
  isAddressDuplicate,
  create,
  update,
  deleteWarga,
}

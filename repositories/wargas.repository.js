const { ObjectId } = require("mongodb")
const { collectionWarga } = require("../config/database")
const entity = require("../entities/warga.entity")

// const getAll = async (keyword, sort_by, order = 1, page = 1, limit = 20) => {
//   try {
//     // await client.connect()
//     let data, keywordRegex
//     if (keyword) {
//       keywordRegex = new RegExp(keyword, "i")
//     }
//     if (keyword && sort_by) {
//       data = await collectionWarga
//         .find({
//           $or: [{ name: keywordRegex }, { address: keywordRegex }],
//         })
//         .sort({ [sort_by]: [order] })
//         .skip((parseInt(page) - 1) * parseInt(limit))
//         .limit(parseInt(limit))
//         .toArray()
//     } else if (keyword) {
//       data = await collectionWarga
//         .find({
//           $or: [{ name: keywordRegex }, { address: keywordRegex }],
//         })
//         .skip((parseInt(page) - 1) * parseInt(limit))
//         .limit(parseInt(limit))
//         .sort({ address: 1 })
//         .toArray()
//     } else if (sort_by) {
//       data = await collectionWarga
//         .find({})
//         .skip((parseInt(page) - 1) * parseInt(limit))
//         .limit(parseInt(limit))
//         .sort({ [sort_by]: [order] })
//         .toArray()
//     } else {
//       data = await collectionWarga
//         .find({})
//         .skip((parseInt(page) - 1) * parseInt(limit))
//         .limit(parseInt(limit))
//         .sort({ address: 1 })
//         .toArray()
//     }

//     const totalItems = await collectionWarga.countDocuments(data)
//     const totalPages = Math.ceil(totalItems / limit)

//     const response = {
//       currentPage: parseInt(page),
//       totalPages: totalPages,
//       totalCount: totalItems,
//       perPage: parseInt(limit),
//       data: data,
//     }

//     return response
//   } catch (err) {
//     console.error("Error connecting to MongoDB:", err)
//     throw err
//   } finally {
//     // client.close()
//   }
// }

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

    const data = await collectionWarga.find(query, options).toArray()
    const totalItems = await collectionWarga.countDocuments(query)
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
    // await client.connect()
    const data = await collectionWarga.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    // client.close()
  }
}

const isAddressDuplicate = async (id, address) => {
  try {
    const query = { address }
    if (id) {
      query._id = { $ne: new ObjectId(id) } // Exclude the current warga ID when checking for duplicates during update
    }
    // await client.connect()
    const existingWarga = await collectionWarga.findOne(query)
    return !!existingWarga
  } catch (err) {
    console.error("Error checking duplicate address:", err)
    throw err
  }
}

const create = async (data) => {
  try {
    // await client.connect()
    const isDuplicate = await isAddressDuplicate(null, data?.address)
    if (isDuplicate) {
      return false
    }
    const warga = entity.wargaEntity(data)
    const result = await collectionWarga.insertOne(warga)
    return result.insertedId
  } catch (err) {
    console.error("Error creating warga:", err)
    throw err
  } finally {
    // client.close()
  }
}

const update = async (data) => {
  try {
    // await client.connect()
    const isDuplicate = await isAddressDuplicate(data?.id, data?.address)
    if (isDuplicate) {
      return false
    }
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
  } finally {
    // client.close()
  }
}

const deleteWarga = async (id) => {
  try {
    // await client.connect()
    const result = await collectionWarga.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting warga:", err)
    throw err
  } finally {
    // client.close()
  }
}

module.exports = {
  getAll,
  getByID,
  isAddressDuplicate,
  create,
  update,
  deleteWarga,
}

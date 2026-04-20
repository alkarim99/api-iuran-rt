const { ObjectId } = require("mongodb")
const { collUser } = require("../config/database")

const getAll = async () => {
  try {
    const data = await collUser.find({}).toArray()
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getByID = async (id) => {
  try {
    const data = await collUser.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getByEmail = async (email) => {
  try {
    const data = await collUser.findOne({ email })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const isEmailUnique = async (email, id) => {
  try {
    let emails
    if (id) {
      emails = await collUser.findOne({
        email,
        _id: { $ne: new ObjectId(id) },
      })
    } else {
      emails = await collUser.findOne({ email })
    }
    const isEmailUnique = emails != null
    return isEmailUnique
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const create = async (data) => {
  try {
    const result = await collUser.insertOne(data)
    return result.insertedId
  } catch (err) {
    console.error("Error creating user:", err)
    throw err
  }
}

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        name: data?.name,
        email: data?.email,
        password: data?.password,
        role: data?.role,
        updated_at: new Date(),
      },
    }
    const result = await collUser.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData
    )
    return result.modifiedCount > 0
  } catch (err) {
    console.error("Error updating user:", err)
    throw err
  }
}

const deleteUser = async (id) => {
  try {
    const result = await collUser.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting user:", err)
    throw err
  }
}

module.exports = {
  getAll,
  getByID,
  getByEmail,
  isEmailUnique,
  create,
  update,
  deleteUser,
}

const { ObjectId } = require("mongodb")
const { collUser } = require("../config/database")
const entity = require("../entities/user.entity")

const getAll = async () => {
  try {
    // await client.connect()
    const data = await collUser.find({}).toArray()
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    // client.close()
  }
}

const getByID = async (id) => {
  try {
    // await client.connect()
    const data = await collUser.findOne({ _id: new ObjectId(id) })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  }
}

const getByEmail = async (email) => {
  try {
    // await client.connect()
    const data = await collUser.findOne({ email })
    return data
  } catch (err) {
    console.error("Error connecting to MongoDB:", err)
    throw err
  } finally {
    // client.close()
  }
}

const isEmailUnique = async (email, id) => {
  try {
    // await client.connect()
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
    // await client.connect()
    const user = entity.userEntity(data)
    const result = await collUser.insertOne(user)
    return result.insertedId
  } catch (err) {
    console.error("Error creating user:", err)
    throw err
  } finally {
    // client.close()
  }
}

const update = async (data) => {
  try {
    // await client.connect()
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
  } finally {
    // client.close()
  }
}

const deleteUser = async (id) => {
  try {
    // await client.connect()
    const result = await collUser.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0 // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting user:", err)
    throw err
  } finally {
    // client.close()
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

const bcrypt = require("bcrypt")
const saltRounds = 10
const model = require("../repositories/users.repository")

const validationData = (data) => {
  if (!data?.name) {
    res.status(400).send({
      status: false,
      error: "Bad Request. Param name not found.",
    })
  }
  if (!data?.email) {
    res.status(400).send({
      status: false,
      error: "Bad Request. Param email not found.",
    })
  }
  if (!data?.password) {
    res.status(400).send({
      status: false,
      error: "Bad Request. Param password not found.",
    })
  }
  if (!data?.role) {
    res.status(400).send({
      status: false,
      error: "Bad Request. Param role not found.",
    })
  }
}

const getAll = async (req, res) => {
  try {
    const data = await model.getAll()
    res.send({
      status: true,
      message: "Get data success",
      data,
    })
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    })
  }
}

const getByID = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const data = await model.getByID(id)
    res.send({
      status: true,
      message: "Get data success",
      data,
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    })
  }
}

const getByEmail = async (req, res) => {
  try {
    const { email } = req.body
    const data = await model.getByEmail(email)
    res.send({
      status: true,
      message: "Get data success",
      data,
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    })
  }
}

const create = async (req, res) => {
  try {
    const data = req.body
    validationData(data)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(data?.password, salt, async function (err, hash) {
        // Store hash in your password DB.
        data.password = hash
        const insertedId = await model.create(data)
        if (insertedId) {
          res.send({
            status: true,
            message: "User created successfully",
            insertedId,
          })
        } else {
          res.status(400).send({
            status: false,
            message: "Failed to create user.",
          })
        }
      })
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error creating user",
      error: err.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const data = req.body
    validationData(data)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(data?.password, salt, async function (err, hash) {
        // Store hash in your password DB.
        data.password = hash
        const isUpdated = await model.update(data)
        if (isUpdated) {
          res.send({
            status: true,
            message: "User updated successfully",
          })
        } else {
          res.status(404).send({
            status: false,
            message: "Failed to update user. Data not found.",
          })
        }
      })
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error updating user",
      error: err.message,
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const isDeleted = await model.deleteUser(id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "User deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "User not found or no changes applied",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error deleting user",
      error: err.message,
    })
  }
}

module.exports = { getAll, getByID, getByEmail, create, update, deleteUser }

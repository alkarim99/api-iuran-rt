const bcrypt = require("bcrypt")
const saltRounds = 10
const model = require("../repositories/users.repository")
const jwt = require("jsonwebtoken")
const { getToken } = require("../middleware/jwt.middleware")
const { userEntity } = require("../entities/user.entity")

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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          const data = await model.getAll()
          res.send({
            status: true,
            message: "Get data success",
            data,
          })
        } else {
          const data = await model.getByID(_id)
          res.send({
            status: true,
            message: "Get data success",
            data,
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        let idData
        if (role == "admin") {
          const {
            params: { id },
          } = req
          idData = id
        } else {
          idData = _id
        }
        const data = await model.getByID(idData)
        res.send({
          status: true,
          message: "Get data success",
          data,
        })
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        const { email } = req.body
        const data = await model.getByEmail(email)
        res.send({
          status: true,
          message: "Get data success",
          data,
        })
      }
    )
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
        const user = new userEntity(data)
        const insertedId = await model.create(user)
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        const data = req.body
        if (!data?.id) {
          res.status(400).send({
            status: false,
            error: "Bad Request. Param id not found.",
          })
        }
        if (role != "admin") {
          data.id = _id
        }
        const checkData = await model.getByID(data?.id)
        const payload = {
          id: data?.id,
          name: data?.name ?? checkData?.name,
          email: data?.email ?? checkData?.email,
          password: data?.password ?? checkData?.password,
          role: data?.role ?? checkData?.role,
        }
        const isEmailUnique = await model.isEmailUnique(
          payload?.email,
          data?.id
        )
        if (isEmailUnique) {
          res.status(400).send({
            status: false,
            message: "Email already in use!",
          })
        }
        let isUpdated
        if (data?.password) {
          bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(data?.password, salt, async function (err, hash) {
              payload.password = hash
              isUpdated = await model.update(payload)
            })
          })
        } else {
          isUpdated = await model.update(payload)
        }
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
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        let idDelete
        if (role == "admin") {
          const {
            params: { id },
          } = req
          idDelete = id
        } else {
          idDelete = _id
        }
        const isDeleted = await model.deleteUser(idDelete)
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
      }
    )
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

const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt = require("jsonwebtoken")
const { idSchema, updateSchema } = require("../../dto/users/request")
const { userEntity } = require("../../entities/user.entity")
const usersRepository = require("../../repositories/users.repository")
const { userResponse } = require("../../dto/users/response")

const getAll = async (req, res) => {
  try {
    const data = await usersRepository.getAll()
    const responseData = data.map((data) => new userResponse(data))
    res.send({
      status: true,
      message: "Get data success",
      data: responseData,
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
    const { error, value } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = await usersRepository.getByID(value?.id)
    const responseData = new userResponse(data)
    res.send({
      status: true,
      message: "Get data success",
      data: responseData,
    })
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    })
  }
}

// create users using singup endpoint

const update = async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const checkData = await usersRepository.getByID(value?.id)
    const payload = {
      id: value?.id,
      name: value?.name ?? checkData?.name,
      email: value?.email ?? checkData?.email,
      password: value?.password ?? checkData?.password,
      role: value?.role ?? checkData?.role,
    }

    const isEmailUnique = await usersRepository.isEmailUnique(
      payload?.email,
      value?.id
    )
    if (isEmailUnique) {
      res.status(400).send({
        status: false,
        message: "Email already in use!",
      })
    }

    if (value?.password) {
      const salt = await bcrypt.genSalt(saltRounds)
      value.password = await bcrypt.hash(value.password, salt)
    }

    const isUpdated = await usersRepository.update(payload)

    const responseData = new userResponse(value)
    res.send({
      status: true,
      message: "User updated successfully",
      data: responseData,
    })
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error updating data",
      error: err.message,
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const isDeleted = await usersRepository.delete(value?.id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "User deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to delete user. Data not found.",
      })
    }
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error deleting data",
      error: err.message,
    })
  }
}

module.exports = {
  getAll,
  getByID,
  update,
  deleteUser,
}

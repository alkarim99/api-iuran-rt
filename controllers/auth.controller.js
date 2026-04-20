const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt = require("jsonwebtoken")
const { signUpSchema, signInSchema } = require("../dto/auth/request")
const { signUpResponse, signInResponse } = require("../dto/auth/response")
const { userEntity } = require("../entities/user.entity")
const usersRepository = require("../repositories/users.repository")

const signUp = async (req, res) => {
  try {
    const { error, value } = signUpSchema.validate(req.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }
    if (await usersRepository.isEmailUnique(value.email)) {
      res.status(400).send({
        status: false,
        message: "Email already exists.",
      })
    }

    const salt = await bcrypt.genSalt(saltRounds)
    value.password = await bcrypt.hash(value.password, salt)

    const user = new userEntity(value)
    const insertedId = await usersRepository.create(user)

    if (insertedId) {
      const responseData = new signUpResponse(user)
      return res.send({
        status: true,
        message: "User created successfully",
        data: responseData,
      })
    }

    res.status(400).send({
      status: false,
      message: "Failed to create user.",
    })
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error Sign Up",
      error: err.message,
    })
  }
}

const signIn = async (req, res) => {
  try {
    const { error, value } = signInSchema.validate(req.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const { email, password } = value

    const checkUser = await usersRepository.getByEmail(email)
    if (!checkUser) {
      return res.status(400).json({
        status: false,
        message: "Account not registered!",
      })
    }

    const isPasswordValid = await bcrypt.compare(password, checkUser?.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: "Wrong email and password combination!",
      })
    }

    const token = jwt.sign(
      { ...checkUser, password: null },
      process.env.JWT_PRIVATE_KEY
    )

    const dataResponse = new signInResponse(checkUser)
    return res.send({
      status: true,
      message: "Sign In Success!",
      data: dataResponse,
      token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error Sign In",
      error: err.message,
    })
  }
}

module.exports = { signUp, signIn }

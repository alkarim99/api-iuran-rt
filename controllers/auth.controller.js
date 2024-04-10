const model = require("../repositories/users.repository")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const login = async (req, res) => {
  try {
    const {
      body: { email, password },
    } = req
    if (!(email && password)) {
      res.status(400).send({
        status: false,
        message: "Bad input, please complete all of fields",
      })
    }
    const checkUser = await model.getByEmail(email)
    if (!checkUser) {
      res.status(400).json({
        status: false,
        message: `Account not registered!`,
      })
    }
    bcrypt.compare(password, checkUser?.password, function (err, result) {
      if (result) {
        var token = jwt.sign(
          { ...checkUser, password: null },
          process.env.JWT_PRIVATE_KEY
        )
        res.send({
          status: true,
          message: "Login Success!",
          data: checkUser,
          token,
        })
      } else {
        res.status(400).json({
          status: false,
          message: `Wrong email and password combination!`,
        })
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      status: false,
      message: "Error in server",
    })
  }
}

module.exports = { login }

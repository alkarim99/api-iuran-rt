const jwt = require("jsonwebtoken")

const checkToken = (req, res, next) => {
  if (!req?.headers?.authorization) {
    res.status(401).json({
      status: false,
      message: "Token empty! Please use token for using this route.",
    })
  }
  const token = getToken(req)
  jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.status(401).json({
        status: false,
        message: "Invalid token! Please use correct token.",
      })
    } else {
      next()
    }
  })
}

const getToken = (req) => {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  )

  return token
}

module.exports = { checkToken, getToken }

const jwt = require("jsonwebtoken")

const checkToken = (req, res) => {
  if (!req?.headers?.authorization) {
    res.status(401).json({
      status: false,
      message: "Token empty! Please use token for using this route.",
    })
  }

  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  )

  jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (err, decoded) {
    if (err) {
      res.status(401).json({
        status: false,
        message: "Invalid token! Please use correct token.",
      })
    }
    resolve(decoded)
  })
}

const adminRole = (req, res, next) => {
  const decodedUser = checkToken(req, res)
  if (decodedUser.role !== "admin") {
    return res.status(403).send({
      status: false,
      message: "Not Authorized. Admins only.",
    })
  }
  next()
}

module.exports = { adminRole }

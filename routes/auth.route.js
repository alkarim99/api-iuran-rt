const router = require("express").Router()
const { signUp, signIn } = require("../controllers/auth.controller")
const { adminRole } = require("../middleware/middleware")

router.post("/auth/signup", adminRole, signUp)
router.post("/auth/signin", signIn)

module.exports = router

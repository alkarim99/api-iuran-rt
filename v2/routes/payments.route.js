const router = require("express").Router()
const paymentsController = require("../controllers/payments.controller")
const { adminRole } = require("../../middleware/middleware")

router.post("/v2/payments", adminRole, paymentsController.create)

module.exports = router

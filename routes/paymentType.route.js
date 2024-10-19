const router = require("express").Router()
const paymentTypeController = require("../controllers/paymentType.controller")
const { adminRole } = require("../middleware/middleware")

router.get("/payment-type/:id", adminRole, paymentTypeController.getByID)
router.get("/payment-type", adminRole, paymentTypeController.getAll)
router.post("/payment-type", adminRole, paymentTypeController.create)
router.put("/payment-type", adminRole, paymentTypeController.update)
router.delete(
  "/payment-type/:id",
  adminRole,
  paymentTypeController.deletePaymentType
)

module.exports = router

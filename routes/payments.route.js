const router = require("express").Router()
const paymentsController = require("../controllers/payments.controller")
const { adminRole } = require("../middleware/middleware")

router.get("/payments/warga/:id", adminRole, paymentsController.getByWargaID)
router.get(
  "/payments/latest/:id",
  adminRole,
  paymentsController.getLatestPeriodByWargaID
)
router.get("/payments/report/:id", adminRole, paymentsController.getReports)
router.get("/payments/total", adminRole, paymentsController.getTotalIncome)
router.get("/payments/rincian", adminRole, paymentsController.getByPayAt)
router.get("/payments/method", adminRole, paymentsController.getByPaymentMethod)
router.get("/payments/:id", adminRole, paymentsController.getByID)
router.get("/payments", adminRole, paymentsController.getAll)
router.post("/payments", adminRole, paymentsController.create)
router.put("/payments", adminRole, paymentsController.update)
router.delete("/payments/:id", adminRole, paymentsController.deletePayment)

module.exports = router

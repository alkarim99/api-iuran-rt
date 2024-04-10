const router = require("express").Router()
const paymentsController = require("../controllers/payments.controller")
const { checkToken } = require("../middleware/jwt.middleware")

router.get("/payments/warga/:id", checkToken, paymentsController.getByWargaID)
router.get(
  "/payments/latest/:id",
  checkToken,
  paymentsController.getLatestPeriodByWargaID
)
router.get("/payments/report/:id", checkToken, paymentsController.getReports)
router.get("/payments/total", checkToken, paymentsController.getTotalIncome)
router.get("/payments/:id", checkToken, paymentsController.getByID)
router.get("/payments", checkToken, paymentsController.getAll)
router.post("/payments", checkToken, paymentsController.create)
router.put("/payments", checkToken, paymentsController.update)
router.delete("/payments/:id", checkToken, paymentsController.deletePayment)

module.exports = router

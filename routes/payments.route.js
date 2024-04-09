const router = require("express").Router()
const paymentsController = require("../controllers/payments.controller")

router.get("/payments/:id", paymentsController.getByID)
router.get("/payments", paymentsController.getAll)
router.post("/payments", paymentsController.create)
router.put("/payments", paymentsController.update)
router.delete("/payments/:id", paymentsController.deletePayment)

module.exports = router

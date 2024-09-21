const router = require("express").Router()
const {
  getAll,
  getByID,
  create,
  update,
  deleteExpense,
} = require("../controllers/expense.controller")
const { adminRole } = require("../middleware/middleware")

router.get("/expense", adminRole, getAll)
router.get("/expense/:id", adminRole, getByID)
router.post("/expense", adminRole, create)
router.put("/expense", adminRole, update)
router.delete("/expense/:id", adminRole, deleteExpense)

module.exports = router

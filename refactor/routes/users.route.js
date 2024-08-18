const router = require("express").Router()
const {
  getAll,
  getByID,
  update,
  deleteUser,
} = require("../controllers/users.controller")
const { adminRole } = require("../middleware/middleware")

router.get("/users", adminRole, getAll)
router.get("/users/:id", adminRole, getByID)
router.patch("/users", adminRole, update)
router.delete("/users/:id", adminRole, deleteUser)

module.exports = router

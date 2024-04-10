const router = require("express").Router()
const usersController = require("../controllers/users.controller")

router.get("/users/:id", usersController.getByID)
router.get("/users/email", usersController.getByEmail)
router.get("/users", usersController.getAll)
router.post("/users", usersController.create)
router.put("/users", usersController.update)
router.delete("/users/:id", usersController.deleteUser)

module.exports = router

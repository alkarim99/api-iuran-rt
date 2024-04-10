const router = require("express").Router()
const usersController = require("../controllers/users.controller")
const { checkToken } = require("../middleware/jwt.middleware")

router.get("/users/:id", checkToken, usersController.getByID)
router.get("/users/email", checkToken, usersController.getByEmail)
router.get("/users", checkToken, usersController.getAll)
router.post("/users", checkToken, usersController.create)
router.put("/users", checkToken, usersController.update)
router.delete("/users/:id", checkToken, usersController.deleteUser)

module.exports = router

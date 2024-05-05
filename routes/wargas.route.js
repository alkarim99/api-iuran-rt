const router = require("express").Router()
const wargasController = require("../controllers/wargas.controller")
const { checkToken } = require("../middleware/jwt.middleware")

router.get("/wargas/option", checkToken, wargasController.getAllOption)
router.get("/wargas/:id", checkToken, wargasController.getByID)
router.get("/wargas", checkToken, wargasController.getAll)
router.post("/wargas", checkToken, wargasController.create)
router.patch("/wargas", checkToken, wargasController.update)
router.delete("/wargas/:id", checkToken, wargasController.deleteWarga)

module.exports = router

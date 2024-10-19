const router = require("express").Router()
const wargasController = require("../controllers/wargas.controller")
const { adminRole } = require("../middleware/middleware")

router.get("/wargas/option", adminRole, wargasController.getAllOption)
router.get("/wargas/:id", adminRole, wargasController.getByID)
router.get("/wargas", adminRole, wargasController.getAll)
// router.post("/wargas", adminRole, wargasController.create)
// router.patch("/wargas", adminRole, wargasController.update)
router.delete("/wargas/:id", adminRole, wargasController.deleteWarga)

module.exports = router

const router = require("express").Router()
const wargasController = require("../controllers/wargas.controller")

router.get("/wargas/:id", wargasController.getByID)
router.get("/wargas", wargasController.getAll)
router.post("/wargas", wargasController.create)
router.patch("/wargas", wargasController.update)
router.delete("/wargas/:id", wargasController.deleteWarga)

module.exports = router

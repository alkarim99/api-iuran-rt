const router = require("express").Router()
const wargasController = require("../controllers/wargas.controller")
const { adminRole } = require("../../middleware/middleware")

router.post("/wargas", adminRole, wargasController.create)
router.patch("/wargas", adminRole, wargasController.update)

module.exports = router

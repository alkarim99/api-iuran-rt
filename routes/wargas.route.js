const router = require("express").Router()
const wargasController = require("../controllers/wargas.controller")

router.get("/wargas", wargasController.getAll)

module.exports = router

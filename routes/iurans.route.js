const router = require("express").Router()
const iuransController = require("../controllers/iurans.controller")

router.get("/iurans/:id", iuransController.getByID)
router.get("/iurans", iuransController.getAll)
router.post("/iurans", iuransController.create)
router.put("/iurans", iuransController.update)
router.delete("/iurans/:id", iuransController.deleteIuran)

module.exports = router

const express = require("express");
const router = express.Router();
const controller = require("../controllers/openingBalance.controller");
const { adminRole } = require("../middleware/middleware");

router.get("/", adminRole, controller.getOpeningBalances);
router.post("/", adminRole, controller.upsertOpeningBalance);
router.delete("/", adminRole, controller.deleteOpeningBalance);

module.exports = router;

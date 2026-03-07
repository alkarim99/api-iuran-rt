const router = require("express").Router();
const {
  getPettyCashReport,
  getKasRekeningReport,
  getNeracaKasReport,
} = require("../controllers/report.controller");
const { adminRole } = require("../middleware/middleware");

router.get("/reports/petty-cash", adminRole, getPettyCashReport);
router.get("/reports/kas-rekening", adminRole, getKasRekeningReport);
router.get("/reports/neraca-kas", getNeracaKasReport);

module.exports = router;

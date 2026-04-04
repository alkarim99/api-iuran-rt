const router = require("express").Router();
const {
  getTunggakan,
  getMonthlySummary,
  getPaymentHeatmap,
  getTierBreakdown,
  getKasSummary,
} = require("../controllers/dashboard.controller");
const { adminRole } = require("../middleware/middleware");

router.get("/dashboard/tunggakan", adminRole, getTunggakan);
router.get("/dashboard/monthly-summary", adminRole, getMonthlySummary);
router.get("/dashboard/payment-heatmap", adminRole, getPaymentHeatmap);
router.get("/dashboard/tier-breakdown", adminRole, getTierBreakdown);
router.get("/dashboard/kas-summary", adminRole, getKasSummary);

module.exports = router;

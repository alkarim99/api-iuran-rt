const router = require("express").Router();
const {
  migrateExpenses,
  fixWargaIdPayments,
} = require("../controllers/migration.controller");
const { adminRole } = require("../middleware/middleware");

// Keep this protected by adminRole to prevent unauthorized triggers
router.post("/migrations/expense-v2", adminRole, migrateExpenses);
router.post("/migrations/fix-warga-id-payments", adminRole, fixWargaIdPayments);

module.exports = router;

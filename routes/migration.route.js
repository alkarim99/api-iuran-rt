const router = require("express").Router();
const { migrateExpenses } = require("../controllers/migration.controller");
const { adminRole } = require("../middleware/middleware");

// Keep this protected by adminRole to prevent unauthorized triggers
router.post("/migrations/expense-v2", adminRole, migrateExpenses);

module.exports = router;

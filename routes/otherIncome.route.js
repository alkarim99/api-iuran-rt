const router = require("express").Router();
const {
  getAll,
  getByID,
  getByTransactionAt,
  create,
  update,
  deleteOtherIncome,
} = require("../controllers/otherIncome.controller");
const { adminRole } = require("../middleware/middleware");

router.get("/other-income", adminRole, getAll);
router.get("/other-income/periode", adminRole, getByTransactionAt);
router.get("/other-income/:id", adminRole, getByID);
router.post("/other-income", adminRole, create);
router.put("/other-income", adminRole, update);
router.delete("/other-income/:id", adminRole, deleteOtherIncome);

module.exports = router;

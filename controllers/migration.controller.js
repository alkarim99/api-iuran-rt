const { collExpense, collExpenseV2 } = require("../config/database");

const migrateExpenses = async (req, res) => {
  try {
    // 1. Fetch all documents from the old expense collection
    const oldExpenses = await collExpense.find({}).toArray();

    if (oldExpenses.length === 0) {
      return res.send({
        status: true,
        message: "No expenses found to migrate.",
      });
    }

    // 2. Map old expenses to include the payment_method
    const migratedExpenses = oldExpenses.map((expense) => {
      return {
        ...expense,
        payment_method: expense.payment_method || "Cash", // Default to Cash if not present
      };
    });

    // 3. Clear existing documents in the new collection to avoid duplicate ID issues on re-run
    await collExpenseV2.deleteMany({});

    // 4. Insert all mapped documents into the new collection
    const result = await collExpenseV2.insertMany(migratedExpenses);

    res.send({
      status: true,
      message: "Migration to expenses_v2 completed successfully.",
      migratedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).send({
      status: false,
      message: "An error occurred during migration.",
      error: error.message,
    });
  }
};

module.exports = {
  migrateExpenses,
};

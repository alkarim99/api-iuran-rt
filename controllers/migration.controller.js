const { collExpense, collExpenseV2, collPayment } = require("../config/database");
const { ObjectId } = require("mongodb");

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
        payment_method: expense.payment_method || "cash", // Default to Cash if not present
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

const fixWargaIdPayments = async (req, res) => {
  try {
    const payments = await collPayment
      .find({
        "warga._id": { $type: "string" },
      })
      .toArray();

    if (payments.length === 0) {
      return res.send({
        status: true,
        message: "No payments found with warga._id as string.",
        fixedCount: 0,
      });
    }

    let fixedCount = 0;
    for (const payment of payments) {
      const stringId = payment.warga?._id;
      if (
        stringId &&
        stringId.length === 24 &&
        /^[0-9a-fA-F]+$/.test(stringId)
      ) {
        try {
          await collPayment.updateOne(
            { _id: payment._id },
            { $set: { "warga._id": new ObjectId(stringId) } },
          );
          fixedCount++;
        } catch (e) {
          // Skip errors for individual records
        }
      }
    }

    res.send({
      status: true,
      message: `Successfully fixed ${fixedCount} warga._id records in payments collection.`,
      fixedCount,
    });
  } catch (error) {
    console.error("Fix error:", error);
    res.status(500).send({
      status: false,
      message: "An error occurred during the fix process.",
      error: error.message,
    });
  }
};

module.exports = {
  migrateExpenses,
  fixWargaIdPayments,
};

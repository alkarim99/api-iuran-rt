require("dotenv").config();
const { collPayment } = require("../config/database");
const { ObjectId } = require("mongodb");

async function fixWargaId() {
  console.log("Starting warga._id fix in payments collection...");

  try {
    // Find all payments where warga._id is a string
    const payments = await collPayment.find({
      "warga._id": { $type: "string" }
    }).toArray();

    if (payments.length === 0) {
      console.log("No payments found with warga._id as string.");
      process.exit(0);
    }

    console.log(`Found ${payments.length} records. Processing...`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const payment of payments) {
      const stringId = payment.warga?._id;

      // Validate if it's a valid ObjectId string (24 hex characters)
      if (stringId && stringId.length === 24 && /^[0-9a-fA-F]+$/.test(stringId)) {
        try {
          const objectId = new ObjectId(stringId);
          
          await collPayment.updateOne(
            { _id: payment._id },
            { $set: { "warga._id": objectId } }
          );

          fixedCount++;
          if (fixedCount % 100 === 0) {
            console.log(`Fixed ${fixedCount} records...`);
          }
        } catch (err) {
          console.error(`Error converting ${stringId} for payment ${payment._id}:`, err.message);
          errorCount++;
        }
      } else {
        console.warn(`Invalid ObjectId format or missing ID: "${stringId}" in payment ${payment._id}. Skipping.`);
        errorCount++;
      }
    }

    console.log("Fix finished successfully.");
    console.log(`Total fixed: ${fixedCount}`);
    console.log(`Total errors/skipped: ${errorCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Fix failed:", error);
    process.exit(1);
  }
}

fixWargaId();

require("dotenv").config();
const { collOtherIncome, collOpeningBalance } = require("../config/database");

async function migrateData() {
  console.log("Starting opening balance migration...");

  try {
    // 1. Ambil data dengan description mengandung kata 'Saldo Awal' dari other_incomes
    const result = await collOtherIncome.find({
      description: { $regex: /saldo awal/i },
      migrated_to_opening_balance: { $ne: true } // Jangan ambil yang sudah bermigrasi
    }).toArray();

    if (result.length === 0) {
      console.log("No legacy opening balance records found to migrate.");
      process.exit(0);
    }

    console.log(`Found ${result.length} records. Processing...`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const record of result) {
      // 2. Tentukan tipe
      let type = "rekening";
      if (record.payment_method === "cash") {
        type = "petty_cash";
      }

      // 3. Tentukan tahun
      const txDate = new Date(record.transaction_at);
      const year = txDate.getFullYear();
      if (isNaN(year)) {
        console.error(`Invalid transaction_at for record ${record._id}. Skipping.`);
        skippedCount++;
        continue;
      }

      const nominal = parseFloat(record.nominal) || 0;

      // 4. Insert ke opening_balances collection
      const filter = { year, type };
      const updateDoc = {
        $set: {
          nominal: nominal,
          note: "Migrated from other incomes",
          updated_at: new Date(),
          _class: "OpeningBalance",
        },
        $setOnInsert: {
          created_at: new Date()
        }
      };

      await collOpeningBalance.findOneAndUpdate(filter, updateDoc, { upsert: true });

      // 5. Tandai record lama sudah termigrasi
      await collOtherIncome.updateOne(
        { _id: record._id },
        { $set: { migrated_to_opening_balance: true } }
      );

      console.log(`Migrated: year ${year}, type ${type}, nominal ${nominal}`);
      migratedCount++;
    }

    console.log("Migration finished successfully.");
    console.log(`Total migrated: ${migratedCount}`);
    console.log(`Total skipped: ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateData();

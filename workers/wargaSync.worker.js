const { collPayment } = require("../config/database");
const { ObjectId } = require("mongodb");

/**
 * Worker function to synchronize citizen (warga) data in payment records.
 * This runs asynchronously to avoid blocking the main thread during large updates.
 * 
 * @param {string} wargaId - The ID of the citizen being updated.
 * @param {Object} newData - The new data to sync (name, address).
 */
const syncWargaToPayments = async (wargaId, newData) => {
  console.log(`[Worker] Starting sync for Warga ID: ${wargaId}`);
  try {
    const filter = { "warga._id": new ObjectId(wargaId) };
    const updateDoc = {
      $set: {
        "warga.name": newData.name,
        "warga.address": newData.address,
        "updated_at": new Date()
      }
    };

    const result = await collPayment.updateMany(filter, updateDoc);
    console.log(`[Worker] Sync complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error(`[Worker] Failed to sync warga data to payments:`, error);
  }
};

module.exports = { syncWargaToPayments };

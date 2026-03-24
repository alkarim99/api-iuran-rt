const { collOpeningBalance } = require("../config/database");

/**
 * Buat index unik pada year + type secara asinkron di awal
 * Ini mengikuti instruksi "compound unique index pada { year, type }"
 */
collOpeningBalance.createIndex({ year: 1, type: 1 }, { unique: true }).catch(err => {
  console.error("Failed to create index for OpeningBalance", err);
});

const getAll = async (year) => {
  try {
    let query = {};
    if (year) {
      query.year = parseInt(year);
    }

    // Ambil semua records yg cocok, default sort berdasar tipe agar stabil
    const data = await collOpeningBalance.find(query).sort({ type: 1 }).toArray();
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getOne = async (year, type) => {
  try {
    const data = await collOpeningBalance.findOne({
      year: parseInt(year),
      type: type,
    });
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err; // or return null safely based on use cases, but throw is standard here
  }
};

const upsert = async (year, type, nominal, note) => {
  try {
    const filter = {
      year: parseInt(year),
      type: type,
    };
    
    const updateDoc = {
      $set: {
        nominal: parseFloat(nominal || 0),
        note: note || "",
        updated_at: new Date(),
        _class: "OpeningBalance",
      },
      $setOnInsert: {
        created_at: new Date()
      }
    };

    const options = {
      upsert: true,
      returnDocument: "after", // returns the updated document
    };

    const result = await collOpeningBalance.findOneAndUpdate(
      filter,
      updateDoc,
      options
    );
    
    return result.value || result; // depending on MongoDB driver version, .value is used
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const deleteOne = async (year, type) => {
  try {
    const result = await collOpeningBalance.deleteOne({
      year: parseInt(year),
      type: type,
    });
    return result;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports = {
  getAll,
  getOne,
  upsert,
  deleteOne,
};

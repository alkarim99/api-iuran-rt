const { ObjectId } = require("mongodb");
const { collExpenseV2 } = require("../config/database");

const getAll = async (
  keyword,
  sort_by = "transaction_at",
  order = 1,
  page = 1,
  limit = 20,
  payAt = null,
) => {
  try {
    let query = {};
    let options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };

    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i");
      query["$or"] = [{ description: keywordRegex }];
    }

    if (payAt) {
      const [year, month] = payAt.split("-");
      const lastDay = new Date(year, month, 0).getDate();
      const firstDay = new Date(`${payAt}-01T00:00:00.000Z`);
      const endDate = new Date(
        `${payAt}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`,
      );
      query["transaction_at"] = { $gte: firstDay, $lte: endDate };
    }

    let sort = {};
    if (sort_by) {
      sort[sort_by] = order === -1 ? -1 : 1;
      options.sort = sort;
    } else {
      sort = { created_at: -1 };
      options.sort = sort;
    }

    const data = await collExpenseV2.find(query, options).toArray();
    const totalItems = await collExpenseV2.countDocuments(query);

    // Aggregation to sum nominal matching the query
    const sumResult = await collExpenseV2
      .aggregate([
        { $match: query },
        { $group: { _id: null, totalNominal: { $sum: "$nominal" } } },
      ])
      .toArray();
    const totalNominal = sumResult.length > 0 ? sumResult[0].totalNominal : 0;

    const totalPages = Math.ceil(totalItems / limit);

    const response = {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalCount: totalItems,
      totalNominal: totalNominal,
      perPage: parseInt(limit),
      data: data,
    };

    return response;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getByID = async (id) => {
  try {
    const data = await collExpenseV2.findOne({ _id: new ObjectId(id) });
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getByTransactionAt = async (
  firstDay,
  lastDay,
  keyword,
  sort_by,
  page = 1,
  limit = 20,
) => {
  try {
    let query = {};
    let options = {};

    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i");
      query["$or"] = [{ description: keywordRegex }];
    }
    query["$and"] = [{ transaction_at: { $gte: firstDay, $lte: lastDay } }];

    let sort = {};
    sort["transaction_at"] = 1;
    options.sort = sort;

    const data = await collExpenseV2.find(query, options).toArray();
    const totalItems = await collExpenseV2.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const response = {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalCount: totalItems,
      perPage: parseInt(limit),
      data: data,
    };

    return response;
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err);
    throw err;
  }
};

const create = async (data) => {
  try {
    const result = await collExpenseV2.insertOne(data);
    return result.insertedId;
  } catch (err) {
    console.error("Error creating expense:", err);
    throw err;
  }
};

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        description: data?.description,
        nominal: data?.nominal,
        payment_method: data?.payment_method,
        transaction_at: new Date(data?.transaction_at),
        updated_at: new Date(),
      },
    };
    const result = await collExpenseV2.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData,
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error updating expense:", err);
    throw err;
  }
};

const deleteExpense = async (id) => {
  try {
    const result = await collExpenseV2.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0; // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting expense:", err);
    throw err;
  }
};

module.exports = {
  getAll,
  getByID,
  getByTransactionAt,
  create,
  update,
  deleteExpense,
};

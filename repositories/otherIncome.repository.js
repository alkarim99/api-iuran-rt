const { ObjectId } = require("mongodb");
const { collOtherIncome } = require("../config/database");

const getAll = async (
  keyword,
  sort_by = "transaction_at",
  order = 1,
  page = 1,
  limit = 20,
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

    let sort = {};
    if (sort_by) {
      sort[sort_by] = order === -1 ? -1 : 1;
      options.sort = sort;
    } else {
      sort = { created_at: -1 };
      options.sort = sort;
    }

    const data = await collOtherIncome.find(query, options).toArray();
    const totalItems = await collOtherIncome.countDocuments(query);
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
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getByID = async (id) => {
  try {
    const data = await collOtherIncome.findOne({ _id: new ObjectId(id) });
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

    const data = await collOtherIncome.find(query, options).toArray();
    const totalItems = await collOtherIncome.countDocuments(query);
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
    const result = await collOtherIncome.insertOne(data);
    return result.insertedId;
  } catch (err) {
    console.error("Error creating other income:", err);
    throw err;
  }
};

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        description: data?.description,
        nominal: data?.nominal,
        transaction_at: new Date(data?.transaction_at),
        payment_method: data?.payment_method,
        updated_at: new Date(),
      },
    };
    const result = await collOtherIncome.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData,
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error updating other income:", err);
    throw err;
  }
};

const deleteOtherIncome = async (id) => {
  try {
    const result = await collOtherIncome.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch (err) {
    console.error("Error deleting other income:", err);
    throw err;
  }
};

module.exports = {
  getAll,
  getByID,
  getByTransactionAt,
  create,
  update,
  deleteOtherIncome,
};

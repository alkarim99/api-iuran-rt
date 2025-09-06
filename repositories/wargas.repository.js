const { ObjectId } = require("mongodb");
const { collWarga } = require("../config/database");

const getAllOption = async () => {
  try {
    let query = {};

    // Aggregation pipeline
    const pipeline = [
      { $match: query },
      {
        // Add fields by splitting 'address' into two parts: prefix and numeric part
        $addFields: {
          addressPrefix: { $arrayElemAt: [{ $split: ["$address", "-"] }, 0] },
          addressNumber: {
            // Try converting to int; if conversion fails (e.g., '12A'), set addressNumber to null
            $convert: {
              input: { $arrayElemAt: [{ $split: ["$address", "-"] }, 1] },
              to: "int",
              onError: null, // Handle cases where conversion fails
            },
          },
        },
      },
      {
        // Sort by prefix (lexicographically) and numeric part
        $sort: {
          addressPrefix: 1,
          addressNumber: 1,
        },
      },
      {
        // Optionally, project to remove the added fields and return only original data
        $project: {
          addressPrefix: 0,
          addressNumber: 0,
        },
      },
    ];

    // Execute the aggregation pipeline
    const data = await collWarga.aggregate(pipeline).toArray();

    return data;
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err);
    throw err;
  }
};

const getAll = async (
  keyword,
  sort_by = "address",
  order = 1,
  page = 1,
  limit = 20
) => {
  try {
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 100); // cap at 100 for safety
    order = order === -1 ? -1 : 1;

    let query = {};
    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i");
      query["$or"] = [{ name: keywordRegex }, { address: keywordRegex }];
    }

    let sortStage = {};
    if (sort_by === "address") {
      sortStage = {
        addressPrefix: order,
        addressNumber: order,
        addressSuffix: order,
      };
    } else if (sort_by) {
      sortStage[sort_by] = order;
    }

    const pipeline = [
      { $match: query },
      {
        $addFields: {
          addressPrefix: { $arrayElemAt: [{ $split: ["$address", "-"] }, 0] },
          _addressSecond: { $arrayElemAt: [{ $split: ["$address", "-"] }, 1] },
        },
      },
      {
        $addFields: {
          addressNumericMatch: {
            $regexFind: {
              input: { $ifNull: ["$_addressSecond", ""] },
              regex: "^[0-9]+",
            },
          },
        },
      },
      {
        $addFields: {
          addressNumber: {
            $convert: {
              input: "$addressNumericMatch.match",
              to: "int",
              onError: null,
              onNull: null,
            },
          },
          addressSuffix: {
            $cond: [
              { $ifNull: ["$addressNumericMatch.match", false] },
              {
                $substr: [
                  "$_addressSecond",
                  { $strLenCP: "$addressNumericMatch.match" },
                  -1,
                ],
              },
              "",
            ],
          },
        },
      },
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          addressPrefix: 0,
          addressNumber: 0,
          addressSuffix: 0,
          _addressSecond: 0,
          addressNumericMatch: 0,
        },
      },
    ];

    const data = await collWarga.aggregate(pipeline).toArray();
    const totalItems = await collWarga.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      currentPage: page,
      totalPages,
      totalCount: totalItems,
      perPage: limit,
      data,
    };
  } catch (err) {
    console.error("Error retrieving data from MongoDB:", err);
    throw err;
  }
};

const getByID = async (id) => {
  try {
    const data = await collWarga.findOne({ _id: new ObjectId(id) });
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const isAddressDuplicate = async (id, address) => {
  try {
    const query = { address };
    if (id) {
      query._id = { $ne: new ObjectId(id) }; // Exclude the current warga ID when checking for duplicates during update
    }
    const existingWarga = await collWarga.findOne(query);
    return !!existingWarga;
  } catch (err) {
    console.error("Error checking duplicate address:", err);
    throw err;
  }
};

const create = async (data) => {
  try {
    const result = await collWarga.insertOne(data);
    return result.insertedId;
  } catch (err) {
    console.error("Error creating warga:", err);
    throw err;
  }
};

const update = async (data) => {
  try {
    const updateData = {
      $set: {
        name: data?.name,
        address: data?.address,
        updated_at: new Date(),
      },
    };
    const result = await collWarga.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error updating warga:", err);
    throw err;
  }
};

const deleteWarga = async (id) => {
  try {
    const result = await collWarga.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0; // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting warga:", err);
    throw err;
  }
};

module.exports = {
  getAllOption,
  getAll,
  getByID,
  isAddressDuplicate,
  create,
  update,
  deleteWarga,
};

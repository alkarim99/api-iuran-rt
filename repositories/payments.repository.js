const { ObjectId } = require("mongodb");
const { collPayment, collWarga } = require("../config/database");

const getAll = async (
  keyword,
  sort_by = "address",
  order = 1,
  page = 1,
  limit = 20,
) => {
  try {
    page = parseInt(page) || 1;
    limit = Math.min(parseInt(limit) || 20, 100);
    order = order === -1 ? -1 : 1;

    let query = {};

    if (keyword) {
      let keywordRegex = new RegExp(keyword, "i");
      query["$or"] = [
        { "warga.name": keywordRegex },
        { "warga.address": keywordRegex },
      ];
    }

    let sortStage = {};
    sortStage = {
      addressPrefix: order,
      addressNumber: order,
      addressSuffix: order,
    };
    if (sort_by) {
      sortStage[sort_by] = order;
    }

    const pipeline = [
      { $match: query },
      {
        $addFields: {
          addressPrefix: {
            $arrayElemAt: [{ $split: ["$warga.address", "-"] }, 0],
          },
          _addressSecond: {
            $arrayElemAt: [{ $split: ["$warga.address", "-"] }, 1],
          },
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
    ];

    if (Object.keys(sortStage).length > 0) {
      pipeline.push({ $sort: sortStage });
    }

    pipeline.push(
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
    );

    const data = await collPayment.aggregate(pipeline).toArray();
    const totalItems = await collPayment.countDocuments(query);
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

const getByPayAt = async (
  firstDay,
  lastDay,
  keyword,
  sort_by,
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
      query["$or"] = [
        { "warga.name": keywordRegex },
        { "warga.address": keywordRegex },
      ];
    }
    query["$and"] = [{ pay_at: { $gte: firstDay, $lte: lastDay } }];

    let sort = {};
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1;
      options.sort = sort;
    }

    const data = await collPayment.find(query, options).toArray();
    const totalItems = await collPayment.countDocuments(query);
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

const getByID = async (id) => {
  try {
    const data = await collPayment.findOne({ _id: new ObjectId(id) });
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getByWargaID = async (id, sort_by) => {
  try {
    // await client.connect()
    let options = {};

    let sort = {};
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1;
      options.sort = sort;
    }
    const data = await collPayment
      .find({ "warga._id": new ObjectId(id) }, options)
      .toArray();
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getTotalIncome = async (start, end, sort_by, page = 1, limit = 20) => {
  try {
    let query = {
      pay_at: { $gte: new Date(start), $lte: new Date(end) },
    };
    let options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
    };

    let sort = {};
    if (sort_by) {
      sort[sort_by] = sort_by === "asc" ? 1 : -1;
      options.sort = sort;
    }

    const data = await collPayment.find(query, options).toArray();
    const totalItems = await collPayment.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    let totalIncome = 0;
    data.forEach((payment) => {
      totalIncome += parseInt(payment.nominal);
    });

    const response = {
      currentPage: parseInt(page),
      totalPages: totalPages,
      totalCount: totalItems,
      perPage: parseInt(limit),
      totalIncome,
      data: data,
    };

    return response;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getLatestPeriodByWargaID = async (id) => {
  try {
    const data = await collPayment.findOne(
      { "warga._id": new ObjectId(id) },
      { sort: { pay_at: -1 }, projection: { period_end: 1, _id: 0 } },
    );
    return data?.period_end;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getByPaymentMethod = async (firstDay, lastDay, paymentMethod) => {
  try {
    let query = {};

    query["$and"] = [
      { pay_at: { $gte: firstDay, $lte: lastDay } },
      {
        payment_method: paymentMethod,
      },
    ];

    let options = {};

    let sort = {};
    sort["pay_at"] = 1;
    options.sort = sort;

    const data = await collPayment.find(query, options).toArray();
    const totalItems = await collPayment.countDocuments(query);

    const response = {
      totalCount: totalItems,
      data: data,
    };

    return response;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const getByWargaAndPeriod = async (wargaId, periodStart, periodEnd) => {
  try {
    const query = {
      "warga._id": new ObjectId(wargaId),
      $or: [
        {
          period_start: { $lte: new Date(periodEnd) },
          period_end: { $gte: new Date(periodStart) },
        },
      ],
    };
    const data = await collPayment.findOne(query);
    return data;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

const create = async (data) => {
  try {
    const result = await collPayment.insertOne(data);
    return result.insertedId;
  } catch (err) {
    console.error("Error creating payment:", err);
    throw err;
  }
};

const update = async (data) => {
  try {
    const dataWarga = await collWarga.findOne({
      _id: new ObjectId(data?.warga_id),
    });
    const updateData = {
      $set: {
        warga: {
          _id: dataWarga?._id,
          name: dataWarga?.name,
          address: dataWarga?.address,
        },
        period_start: new Date(data?.period_start),
        period_end: new Date(data?.period_end),
        number_of_period: data?.number_of_period,
        nominal: data?.nominal,
        payment_method: data?.payment_method,
        pay_at: new Date(data?.pay_at),
        details_payment: data?.details_payment,
        updated_at: new Date(),
      },
    };
    const result = await collPayment.updateOne(
      { _id: new ObjectId(data?.id) },
      updateData,
    );
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("Error updating payment:", err);
    throw err;
  }
};

const deletePayment = async (id) => {
  try {
    const result = await collPayment.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0; // Return true if a document was deleted
  } catch (err) {
    console.error("Error deleting payment:", err);
    throw err;
  }
};

const getMonthlyReportByPricingTier = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const TIER_75 = 75000;
    const TIER_110 = 110000;

    const pipeline = [
      // 1. Filter rentang tanggal
      {
        $match: {
          pay_at: { $gte: start, $lte: end },
        },
      },

      // 2. Kategorisasi nominal tiap pembayaran
      {
        $addFields: {
          pricingCategory: {
            $switch: {
              branches: [
                // --- Tier 75rb ---
                // Tepat 1x 75rb
                {
                  case: { $eq: ["$nominal", TIER_75] },
                  then: "tier_75_single",
                },
                // Kelipatan 75rb (2x atau lebih, sisa mod = 0)
                {
                  case: {
                    $and: [
                      { $gt: ["$nominal", TIER_75] },
                      {
                        $eq: [{ $mod: ["$nominal", TIER_75] }, 0],
                      },
                    ],
                  },
                  then: "tier_75_multiple",
                },

                // --- Tier 110rb ---
                // Tepat 1x 110rb
                {
                  case: { $eq: ["$nominal", TIER_110] },
                  then: "tier_110_single",
                },
                // Kelipatan 110rb (2x atau lebih, sisa mod = 0)
                {
                  case: {
                    $and: [
                      { $gt: ["$nominal", TIER_110] },
                      {
                        $eq: [{ $mod: ["$nominal", TIER_110] }, 0],
                      },
                    ],
                  },
                  then: "tier_110_multiple",
                },
              ],
              // Nominal di luar kelipatan 75rb atau 110rb
              default: "out_of_tier",
            },
          },

          // Buat field bulan untuk pengelompokan
          monthYear: {
            $dateToString: {
              format: "%Y-%m",
              date: "$pay_at",
            },
          },
        },
      },

      // 3. Group per bulan + payment_method + kategori
      {
        $group: {
          _id: {
            monthYear: "$monthYear",
            payment_method: "$payment_method",
            category: "$pricingCategory",
          },
          count: { $sum: 1 },
          totalNominal: { $sum: "$nominal" },
          wargaList: {
            $push: {
              warga_id: "$warga._id",
              name: "$warga.name",
              address: "$warga.address",
              nominal: "$nominal",
              number_of_period: "$number_of_period",
              pay_at: "$pay_at",
            },
          },
        },
      },

      // 4. Group per bulan + payment_method (gabungkan semua kategori)
      {
        $group: {
          _id: {
            monthYear: "$_id.monthYear",
            payment_method: "$_id.payment_method",
          },
          categories: {
            $push: {
              category: "$_id.category",
              count: "$count",
              totalNominal: "$totalNominal",
              wargaList: "$wargaList",
            },
          },
          totalWarga: { $sum: "$count" },
          totalIncome: { $sum: "$totalNominal" },
        },
      },

      // 5. Group per bulan (gabungkan cash & transfer)
      {
        $group: {
          _id: "$_id.monthYear",
          paymentMethods: {
            $push: {
              payment_method: "$_id.payment_method",
              categories: "$categories",
              totalWarga: "$totalWarga",
              totalIncome: "$totalIncome",
            },
          },
          grandTotalWarga: { $sum: "$totalWarga" },
          grandTotalIncome: { $sum: "$totalIncome" },
        },
      },

      // 6. Sort berdasarkan bulan ascending
      {
        $sort: { _id: 1 },
      },
    ];

    const rawData = await collPayment.aggregate(pipeline).toArray();

    // 7. Format output
    const CATEGORY_LABEL = {
      tier_75_single: "Tepat 1x Rp 75.000",
      tier_75_multiple: "Kelipatan Rp 75.000 (≥ 2 periode)",
      tier_110_single: "Tepat 1x Rp 110.000",
      tier_110_multiple: "Kelipatan Rp 110.000 (≥ 2 periode)",
      out_of_tier: "Nominal di luar tier",
    };

    const CATEGORY_ORDER = [
      "tier_75_single",
      "tier_75_multiple",
      "tier_110_single",
      "tier_110_multiple",
      "out_of_tier",
    ];

    const formatted = rawData.map((monthGroup) => {
      const sortedMethods = monthGroup.paymentMethods
        // Urutkan payment_method: cash duluan
        .sort((a, b) => a.payment_method.localeCompare(b.payment_method))
        .map((method) => {
          const sortedCategories = [...method.categories].sort(
            (a, b) =>
              CATEGORY_ORDER.indexOf(a.category) -
              CATEGORY_ORDER.indexOf(b.category),
          );
          return {
            payment_method: method.payment_method,
            total_warga: method.totalWarga,
            total_income: method.totalIncome,
            breakdown: sortedCategories.map((cat) => ({
              category: cat.category,
              label: CATEGORY_LABEL[cat.category] ?? cat.category,
              count: cat.count,
              total_nominal: cat.totalNominal,
              warga: cat.wargaList,
            })),
          };
        });

      return {
        month: monthGroup._id, // format: "2025-01"
        grand_total_warga: monthGroup.grandTotalWarga,
        grand_total_income: monthGroup.grandTotalIncome,
        payment_methods: sortedMethods,
      };
    });

    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
      total_months: formatted.length,
      report: formatted,
    };
  } catch (err) {
    console.error("Error generating pricing tier report:", err);
    throw err;
  }
};

module.exports = {
  getAll,
  getByPayAt,
  getByID,
  getByWargaID,
  getByWargaAndPeriod,
  getByPaymentMethod,
  getTotalIncome,
  getLatestPeriodByWargaID,
  create,
  update,
  deletePayment,
  getMonthlyReportByPricingTier,
};

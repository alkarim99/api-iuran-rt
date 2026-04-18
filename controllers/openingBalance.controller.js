const openingBalanceRepository = require("../repositories/openingBalance.repository");
const { filterSchema, upsertSchema, deleteSchema } = require("../dto/openingBalance/request");
const { OpeningBalanceEntity } = require("../entities/openingBalance.entity");

const getOpeningBalances = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message
      });
    }

    const { year, type } = value;

    if (type) {
      const result = await openingBalanceRepository.getOne(year, type);
      if (!result) {
        return res.status(200).json({
          status: "success",
          message: "Data saldo awal belum diatur",
          data: { year: parseInt(year), type, nominal: 0, note: "" }
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Berhasil mengambil saldo awal",
        data: result
      });
    }

    // if no type, get all array 
    const resultList = await openingBalanceRepository.getAll(year);
    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil riwayat saldo awal",
      data: resultList
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

const upsertOpeningBalance = async (req, res) => {
  try {
    const { error, value } = upsertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message
      });
    }

    const { year, type, nominal, note } = value;

    const result = await openingBalanceRepository.upsert(year, type, nominal, note);

    return res.status(200).json({
      status: "success",
      message: "Berhasil menyimpan saldo awal",
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

const deleteOpeningBalance = async (req, res) => {
  try {
    const { error, value } = deleteSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message
      });
    }

    const { year, type } = value;

    await openingBalanceRepository.deleteOne(year, type);

    return res.status(200).json({
      status: "success",
      message: "Saldo awal berhasil dihapus"
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

module.exports = {
  getOpeningBalances,
  upsertOpeningBalance,
  deleteOpeningBalance
};

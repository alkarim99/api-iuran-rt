const model = require("../repositories/otherIncome.repository");
const { createLog } = require("../helpers/audit.helper");
const {
  idSchema,
  createSchema,
  updateSchema,
  filterSchema,
} = require("../dto/otherIncome/request");
const { OtherIncomeEntity } = require("../entities/otherIncome.entity");

const getAll = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const data = await model.getAll(
      value?.keyword,
      value?.sort_by,
      value?.order,
      value?.page,
      value?.limit,
    );
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: error.message,
    });
  }
};

const getByID = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const data = await model.getByID(value?.id);
    res.send({
      status: true,
      message: "Get data success",
      data,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: error.message,
    });
  }
};

const getByTransactionAt = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const { transaction_at, keyword, sort_by, order, page, limit } = value;
    const transactionAt = new Date(transaction_at);
    // Determine the month bounds
    const firstDay = new Date(
      transactionAt.getFullYear(),
      transactionAt.getMonth(),
      1,
    );
    const lastDay = new Date(
      transactionAt.getFullYear(),
      transactionAt.getMonth() + 1,
      0,
    );
    const data = await model.getByTransactionAt(
      firstDay,
      lastDay,
      keyword,
      sort_by,
      page,
      limit,
    );

    let totalNominal = 0;
    data?.data?.forEach((element) => {
      totalNominal = totalNominal + element?.nominal;
    });

    res.send({
      status: true,
      message: "Get data success",
      totalNominal,
      ...data,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req?.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const otherIncome = new OtherIncomeEntity(value);
    const insertedId = await model.create(otherIncome);
    if (insertedId) {
      await createLog(
        req,
        "CREATE",
        "PEMASUKAN_LAINNYA",
        `Mencatat Pemasukan Lainnya sebesar Rp${value.nominal}`,
        null,
        value,
      );
      res.send({
        status: true,
        message: "Other income created successfully",
        insertedId,
      });
    } else {
      res.status(400).send({
        status: false,
        message: "Error creating data",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error creating data",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { error, value } = updateSchema.validate(req?.body);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const oldData = await model.getByID(value.id);
    const isUpdated = await model.update(value);
    if (isUpdated) {
      await createLog(
        req,
        "UPDATE",
        "PEMASUKAN_LAINNYA",
        `Mengubah data Pemasukan Lainnya ID ${value.id}`,
        oldData,
        value,
      );
      res.send({
        status: true,
        message: "Other income updated successfully",
      });
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to update. Data not found.",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error updating data",
      error: error.message,
    });
  }
};

const deleteOtherIncome = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }
    const oldData = await model.getByID(value.id);
    const isDeleted = await model.deleteOtherIncome(value?.id);
    if (isDeleted) {
      await createLog(
        req,
        "DELETE",
        "PEMASUKAN_LAINNYA",
        `Menghapus Pemasukan Lainnya ID ${value.id}`,
        oldData,
        null,
      );
      res.send({
        status: true,
        message: "Other income deleted successfully",
      });
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to delete. Data not found.",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Error deleting data",
      error: error.message,
    });
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

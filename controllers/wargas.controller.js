const model = require("../repositories/wargas.repository");
const { createLog } = require("../helpers/audit.helper");
const {
  idSchema,
  createSchema,
  updateSchema,
  filterSchema,
} = require("../dto/wargas/request");
const { WargaEntity } = require("../entities/warga.entity");
const { syncWargaToPayments } = require("../workers/wargaSync.worker");

const getAllOption = async (req, res) => {
  try {
    const data = await model.getAllOption();
    res.send({
      status: true,
      message: "Get data success",
      data,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

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
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
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
  } catch (err) {
    console.log(err);
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

    const data = value;
    if (!data?.name) {
      return res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Param name not found.",
      });
    }

    if (!data?.address) {
      return res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Param address not found.",
      });
    }

    const isDuplicate = await model.isAddressDuplicate(null, data?.address);

    if (isDuplicate) {
      return res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Duplicate address.",
      });
    }

    const warga = new WargaEntity(data);
    const insertedId = await model.create(warga);

    if (insertedId) {
      await createLog(
        req,
        "CREATE",
        "WARGA",
        `Menambah data Warga: ${data.name}`,
        null,
        data,
        "warga",
      );
      res.send({
        status: true,
        message: "Warga created successfully",
        insertedId,
      });
    } else {
      res.status(400).send({
        status: false,
        message: "Failed to create warga. Duplicate address found.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error creating warga",
      error: err.message,
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

    const data = value;
    const isDuplicate = await model.isAddressDuplicate(data?.id, data?.address);
    if (isDuplicate) {
      return res.status(400).send({
        status: false,
        message: "Error updating data",
        error: "Bad Request. Duplicate address.",
      });
    }

    const oldData = await model.getByID(data.id);
    const isUpdated = await model.update(data);
    if (isUpdated) {
      // Sync payment records asynchronously (Fire and Forget)
      syncWargaToPayments(data.id, { name: data.name, address: data.address });

      await createLog(
        req,
        "UPDATE",
        "WARGA",
        `Mengubah data Warga ID ${data.id}`,
        oldData,
        data,
        "warga",
      );
      res.send({
        status: true,
        message: "Warga updated successfully",
      });
    } else {
      res.status(404).send({
        status: false,
        message:
          "Failed to update warga. Data not found or Duplicate address found.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error updating warga",
      error: err.message,
    });
  }
};

const deleteWarga = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const oldData = await model.getByID(value.id);
    const isDeleted = await model.deleteWarga(value?.id);
    if (isDeleted) {
      await createLog(
        req,
        "DELETE",
        "WARGA",
        `Menghapus Warga ID ${value.id}`,
        oldData,
        null,
        "warga",
      );
      res.send({
        status: true,
        message: "Warga deleted successfully",
      });
    } else {
      res.status(404).send({
        status: false,
        message: "Warga not found or no changes applied",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: false,
      message: "Error deleting warga",
      error: err.message,
    });
  }
};

module.exports = { getAllOption, getAll, getByID, create, update, deleteWarga };

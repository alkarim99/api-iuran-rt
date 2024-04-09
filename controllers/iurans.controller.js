const model = require("../repositories/iurans.repository")

const validationData = (data) => {
  if (!data?.warga_id) {
    res.status(400).send({
      status: false,
      message: "Error creating data",
      error: "Bad Request. Param warga_id not found.",
    })
  }
  if (!data?.payment_id) {
    res.status(400).send({
      status: false,
      message: "Error creating data",
      error: "Bad Request. Param payment_id not found.",
    })
  }
  if (!data?.period) {
    res.status(400).send({
      status: false,
      message: "Error creating data",
      error: "Bad Request. Param period not found.",
    })
  }
  if (!data?.nominal) {
    res.status(400).send({
      status: false,
      message: "Error creating data",
      error: "Bad Request. Param nominal not found.",
    })
  }
  if (!data?.pay_at) {
    res.status(400).send({
      status: false,
      message: "Error creating data",
      error: "Bad Request. Param pay_at not found.",
    })
  }
}

const getAll = async (req, res) => {
  try {
    const data = await model.getAll()
    res.send({
      status: true,
      message: "Get data success",
      data,
    })
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    })
  }
}

const getByID = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const data = await model.getByID(id)
    res.send({
      status: true,
      message: "Get data success",
      data,
    })
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    })
  }
}

const create = async (req, res) => {
  try {
    const data = req.body
    validationData(data)
    const insertedId = await model.create(data)
    if (insertedId) {
      res.send({
        status: true,
        message: "Iuran created successfully",
        insertedId,
      })
    } else {
      res.status(400).send({
        status: false,
        message: "Failed to create iuran.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error creating iuran",
      error: err.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const data = req.body
    validationData(data)
    const isUpdated = await model.update(data)
    if (isUpdated) {
      res.send({
        status: true,
        message: "Iuran updated successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to update iuran. Data not found.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error updating iuran",
      error: err.message,
    })
  }
}

const deleteIuran = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const isDeleted = await model.deleteIuran(id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "Iuran deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Iuran not found or no changes applied",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error deleting iuran",
      error: err.message,
    })
  }
}

module.exports = { getAll, getByID, create, update, deleteIuran }

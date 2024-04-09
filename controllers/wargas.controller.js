const model = require("../repositories/wargas.repository")

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
    if (!data?.name) {
      res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Param name not found.",
      })
    }
    if (!data?.address) {
      res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Param address not found.",
      })
    }
    const insertedId = await model.create(data)
    if (insertedId) {
      res.send({
        status: true,
        message: "Warga created successfully",
        insertedId,
      })
    } else {
      res.status(400).send({
        status: false,
        message: "Failed to create warga. Duplicate address found.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error creating warga",
      error: err.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const data = req.body
    const isUpdated = await model.update(data)
    if (isUpdated) {
      res.send({
        status: true,
        message: "Warga updated successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message:
          "Failed to update warga. Data not found or Duplicate address found.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error updating warga",
      error: err.message,
    })
  }
}

const deleteWarga = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const isDeleted = await model.deleteWarga(id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "Warga deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Warga not found or no changes applied",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error deleting warga",
      error: err.message,
    })
  }
}

module.exports = { getAll, getByID, create, update, deleteWarga }

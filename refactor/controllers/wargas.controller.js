const model = require("../../repositories/wargas.repository")
const {
  idSchema,
  createSchema,
  updateSchema,
  filterSchema,
} = require("../../dto/wargas/request")
const { wargaEntity } = require("../../entities/warga.entity")

const getAllOption = async (req, res) => {
  try {
    const data = await model.getAllOption()
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

const getAll = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req?.query)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = await model.getAll(
      value?.keyword,
      value?.sort_by,
      value?.order,
      value?.page,
      value?.limit
    )
    res.send({
      status: true,
      message: "Get data success",
      ...data,
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
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = await model.getByID(value?.id)
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
    const { error, value } = createSchema.validate(req?.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = value
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

    const isDuplicate = await model.isAddressDuplicate(null, data?.address)

    if (isDuplicate) {
      res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Duplicate address.",
      })
    }

    const warga = new wargaEntity(data)
    const insertedId = await model.create(warga)

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
    const { error, value } = updateSchema.validate(req?.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const data = value
    const isDuplicate = await model.isAddressDuplicate(data?.id, data?.address)
    if (isDuplicate) {
      res.status(400).send({
        status: false,
        message: "Error creating data",
        error: "Bad Request. Duplicate address.",
      })
    }

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
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const isDeleted = await model.deleteWarga(value?.id)
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

module.exports = { getAllOption, getAll, getByID, create, update, deleteWarga }

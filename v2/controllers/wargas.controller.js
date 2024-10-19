const model = require("../../repositories/wargas.repository")
const { createSchema, updateSchema } = require("../dto/wargas/request")
const { wargaEntity } = require("../entities/warga.entity")

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

    data.updated_at = new Date()
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

module.exports = { create, update }

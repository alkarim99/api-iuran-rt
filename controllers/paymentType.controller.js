const model = require("../repositories/paymentType.repository")
const {
  idSchema,
  createSchema,
  updateSchema,
} = require("../dto/paymentType/request")
const { paymentTypeEntity } = require("../entities/paymentType.entity")

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

    const paymentType = new paymentTypeEntity(data)
    const insertedId = await model.create(paymentType)

    if (insertedId) {
      res.send({
        status: true,
        message: "Payment type created successfully",
        insertedId,
      })
    } else {
      res.status(400).send({
        status: false,
        message: "Failed to create payment type.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error creating payment type",
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

    const isUpdated = await model.update(data)
    if (isUpdated) {
      res.send({
        status: true,
        message: "Payment type updated successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to update payment type.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error updating payment type",
      error: err.message,
    })
  }
}

const deletePaymentType = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const isDeleted = await model.deletePaymentType(value?.id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "Payment type deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Payment type not found or no changes applied",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error deleting payment type",
      error: err.message,
    })
  }
}

module.exports = { getAll, getByID, create, update, deletePaymentType }

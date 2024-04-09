const model = require("../repositories/payments.repository")

const validationData = (data) => {
  if (!data?.warga_id) {
    return res.status(400).send({
      status: false,
      message: "Bad Request. Param warga_id not found.",
    })
  }
  if (!data?.period_start) {
    return res.status(400).send({
      status: false,
      message: "Bad Request. Param period_start not found.",
    })
  }
  if (!data?.period_end) {
    return res.status(400).send({
      status: false,
      message: "Bad Request. Param period_start not found.",
    })
  }
  if (!data?.nominal) {
    return res.status(400).send({
      status: false,
      message: "Bad Request. Param nominal not found.",
    })
  }
  if (
    data?.payment_method.toLowerCase() != "cash" &&
    data?.payment_method.toLowerCase() != "transfer"
  ) {
    return res.status(400).send({
      status: false,
      message: "Bad Request. Param payment_method not valid.",
    })
  }
  if (!data?.pay_at) {
    return res.status(400).send({
      status: false,
      message: "Bad Request. Param period_start not found.",
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

const getByWargaID = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const data = await model.getByWargaID(id)
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
    const period_start = new Date(data?.period_start)
    const period_end = new Date(data?.period_end)
    const number_of_period = period_end.getMonth() - period_start.getMonth() + 1
    data.number_of_period = number_of_period
    const insertedId = await model.create(data)
    if (insertedId) {
      res.send({
        status: true,
        message: "Payment created successfully",
        insertedId,
      })
    } else {
      res.status(400).send({
        status: false,
        message: "Failed to create payment.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error creating payment",
      error: err.message,
    })
  }
}

const update = async (req, res) => {
  try {
    const data = req.body
    if (!data?.id) {
      return res.status(400).send({
        status: false,
        message: "Bad Request. Param id not found.",
      })
    }
    validationData(data)
    const period_start = new Date(data?.period_start)
    const period_end = new Date(data?.period_end)
    const number_of_period = period_end.getMonth() - period_start.getMonth() + 1
    data.number_of_period = number_of_period
    const isUpdated = await model.update(data)
    if (isUpdated) {
      res.send({
        status: true,
        message: "Payment updated successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Failed to update payment. Data not found.",
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error updating payment",
      error: err.message,
    })
  }
}

const deletePayment = async (req, res) => {
  try {
    const {
      params: { id },
    } = req
    const isDeleted = await model.deletePayment(id)
    if (isDeleted) {
      res.send({
        status: true,
        message: "Payment deleted successfully",
      })
    } else {
      res.status(404).send({
        status: false,
        message: "Payment not found or no changes applied",
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: "Error deleting payment",
      error: err.message,
    })
  }
}

module.exports = {
  getAll,
  getByID,
  getByWargaID,
  create,
  update,
  deletePayment,
}

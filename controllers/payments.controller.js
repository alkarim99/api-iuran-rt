const { ObjectId } = require("mongodb")
const model = require("../repositories/payments.repository")
const { collWarga } = require("../config/database")
const { paymentEntity } = require("../entities/payment.entity")
const { wargaDataEmbed } = require("../entities/warga.entity")
const {
  idSchema,
  createSchema,
  updateSchema,
  filterSchema,
} = require("../dto/payments/request")
const {
  getAllMonthsBetween,
  getNumberOfPeriods,
  getDetailsPayment,
} = require("../helpers/payment.helper")

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

const getByPayAt = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req?.query)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const { keyword, sort_by, page, limit, pay_at } = value
    const payAt = new Date(pay_at)
    const firstDay = new Date(payAt.getFullYear(), payAt.getMonth(), 1)
    const lastDay = new Date(payAt.getFullYear(), payAt.getMonth() + 1, 0)
    const data = await model.getByPayAt(
      firstDay,
      lastDay,
      keyword,
      sort_by,
      page,
      limit
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

const getByPaymentMethod = async (req, res) => {
  try {
    const { error, value } = filterSchema.validate(req?.query)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }

    const { pay_at, payment_method } = value
    const payAt = new Date(pay_at)
    const firstDay = new Date(payAt.getFullYear(), payAt.getMonth(), 1)
    const lastDay = new Date(payAt.getFullYear(), payAt.getMonth() + 1, 0)
    const data = await model.getByPaymentMethod(
      firstDay,
      lastDay,
      payment_method
    )

    let totalNominal = 0
    data?.data?.forEach((element) => {
      totalNominal = totalNominal + element?.nominal
    })

    res.send({
      status: true,
      message: "Get data success",
      totalNominal,
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

const getByWargaID = async (req, res) => {
  try {
    const {
      params: { id },
      query: { sort_by },
    } = req
    const data = await model.getByWargaID(id, sort_by)
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

const getTotalIncome = async (req, res) => {
  try {
    const { start, end, sort_by, page, limit } = req?.query
    const data = await model.getTotalIncome(start, end, sort_by, page, limit)
    res.send({
      status: true,
      message: "Get data success",
      ...data,
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

const getLatestPeriodByWargaID = async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }
    const latest_period = await model.getLatestPeriodByWargaID(value?.id)
    res.send({
      status: true,
      message: "Get data success",
      latest_period,
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

const getReports = async (req, res) => {
  try {
    const {
      params: { id },
      query: { sort_by },
    } = req
    const data = await model.getByWargaID(id, sort_by)
    let reports = []
    data.forEach((payment) => {
      const months = getAllMonthsBetween(payment)
      reports.push(months)
    })
    reports = reports.reduce((acc, val) => acc.concat(val), [])
    res.send({
      status: true,
      message: "Get data success",
      reports,
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
    let data = value

    const dataWarga = await collWarga.findOne({
      _id: new ObjectId(data?.warga_id),
    })
    data.warga = new wargaDataEmbed(dataWarga)

    data = getNumberOfPeriods(data)
    data = getDetailsPayment(data)

    const payment = new paymentEntity(data)
    const insertedId = await model.create(payment)
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
    const { error, value } = updateSchema.validate(req?.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }
    let data = value

    const dataWarga = await collWarga.findOne({
      _id: new ObjectId(data?.warga_id),
    })
    data.warga = new wargaDataEmbed(dataWarga)

    data = getNumberOfPeriods(data)
    data = getDetailsPayment(data)

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
    const { error, value } = idSchema.validate(req?.params)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }
    const { id } = value
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
  getByPayAt,
  getByID,
  getByWargaID,
  getByPaymentMethod,
  getTotalIncome,
  getLatestPeriodByWargaID,
  getReports,
  create,
  update,
  deletePayment,
}

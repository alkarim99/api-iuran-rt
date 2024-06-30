const { ObjectId } = require("mongodb")
const model = require("../repositories/payments.repository")
const jwt = require("jsonwebtoken")
const { getToken } = require("../middleware/jwt.middleware")
const { collWarga } = require("../config/database")
const {
  paymentEntity,
  detailsPaymentEntity,
} = require("../entities/payment.entity")
const { wargaDataEmbed } = require("../entities/warga.entity")

const validationData = (data, res) => {
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
      message: "Bad Request. Param pay_at not found.",
    })
  }
}

const getAllMonthsBetween = (data) => {
  const result = []

  const nominal = data?.nominal / data?.number_of_period

  // Start from periodStart and iterate until periodEnd
  let currentDate = new Date(data?.period_start)
  const endDate = new Date(data?.period_end)

  // Iterate over each date
  while (currentDate <= endDate) {
    // Extract month and year from the current date
    const month = currentDate.toLocaleString("default", { month: "long" })
    const year = currentDate.getFullYear()

    // Format month and year as a string (e.g., "April 2024")
    const monthYear = `${month} ${year}`

    const document = {
      period: monthYear,
      nominal,
      pay_at: data?.pay_at,
      created_at: data?.created_at,
    }

    // Add the unique combination of month and year to the array
    if (!result.includes(monthYear)) {
      result.push(document)
    }

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return result
}

const getNumberOfPeriods = (data) => {
  const period_start = new Date(data?.period_start)
  const period_end = new Date(data?.period_end)
  const number_of_period =
    (period_end.getFullYear() - period_start.getFullYear()) * 12 +
    (period_end.getMonth() - period_start.getMonth()) +
    1
  data.number_of_period = number_of_period
  return data
}

const getDetailsPayment = (data) => {
  let dataDetails = {}

  if (data?.nominal % 75000 === 0) {
    dataDetails.rt = 75000 * data?.number_of_period
    dataDetails.pkk = 0
    dataDetails.sosial = 0
    dataDetails.kematian = 0
  } else {
    dataDetails.rt = 94500 * data?.number_of_period
    dataDetails.pkk = 8000 * data?.number_of_period
    dataDetails.sosial = 2500 * data?.number_of_period
    dataDetails.kematian = 5000 * data?.number_of_period
  }
  data.details_payment = new detailsPaymentEntity(dataDetails)
  return data
}

const getAll = async (req, res) => {
  try {
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          const { keyword, sort_by, page, limit } = req?.query
          const data = await model.getAll(keyword, sort_by, page, limit)
          res.send({
            status: true,
            message: "Get data success",
            ...data,
          })
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          const {
            params: { id },
          } = req
          const data = await model.getByID(id)
          res.send({
            status: true,
            message: "Get data success",
            data,
          })
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
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
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          const { start, end, sort_by, page, limit } = req?.query
          const data = await model.getTotalIncome(
            start,
            end,
            sort_by,
            page,
            limit
          )
          res.send({
            status: true,
            message: "Get data success",
            ...data,
          })
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          const {
            params: { id },
          } = req
          const latest_period = await model.getLatestPeriodByWargaID(id)
          res.send({
            status: true,
            message: "Get data success",
            latest_period,
          })
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
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
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          let data = req.body
          validationData(data, res)

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
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          let data = req.body
          if (!data?.id) {
            return res.status(400).send({
              status: false,
              message: "Bad Request. Param id not found.",
            })
          }
          validationData(data, res)

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
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
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
        } else {
          res.status(401).send({
            status: false,
            message: "Unauthorized",
          })
        }
      }
    )
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
  getTotalIncome,
  getLatestPeriodByWargaID,
  getReports,
  create,
  update,
  deletePayment,
}

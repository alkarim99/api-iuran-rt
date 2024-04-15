const model = require("../repositories/payments.repository")
const jwt = require("jsonwebtoken")
const { getToken } = require("../middleware/jwt.middleware")

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

const getAll = async (req, res) => {
  try {
    jwt.verify(
      getToken(req),
      process.env.JWT_PRIVATE_KEY,
      async (err, { _id, role }) => {
        if (role == "admin") {
          const keyword = req?.query?.keyword
          const sort_by = req?.query?.sort_by
          const data = await model.getAll(keyword, sort_by)
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
          } = req
          const data = await model.getByWargaID(id)
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
          const start = req?.query?.start
          const end = req?.query?.end
          const total_income = await model.getTotalIncome(start, end)
          res.send({
            status: true,
            message: "Get data success",
            total_income,
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
          } = req
          const data = await model.getByWargaID(id)
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
          const data = req.body
          validationData(data)
          const period_start = new Date(data?.period_start)
          const period_end = new Date(data?.period_end)
          const number_of_period =
            period_end.getMonth() - period_start.getMonth() + 1
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
          const number_of_period =
            period_end.getMonth() - period_start.getMonth() + 1
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

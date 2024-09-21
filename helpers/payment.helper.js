const { detailsPaymentEntity } = require("../entities/payment.entity")

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

module.exports = {
  getAllMonthsBetween,
  getNumberOfPeriods,
  getDetailsPayment,
}

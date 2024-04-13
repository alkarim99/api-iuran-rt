const { ObjectId } = require("mongodb")

const paymentEntity = (data) => {
  const payment = {
    _id: new ObjectId(),
    warga: data?.warga,
    period_start: new Date(data?.period_start),
    period_end: new Date(data?.period_end),
    number_of_period: data?.number_of_period,
    nominal: data?.nominal,
    payment_method: data?.payment_method,
    pay_at: new Date(data?.pay_at),
    created_at: new Date(),
    updated_at: new Date(),
    _class: "Payment",
  }
  return payment
}

module.exports = { paymentEntity }

const { ObjectId } = require("mongodb")

const paymentEntity = (data) => {
  const payment = {
    _id: new ObjectId(),
    warga_id: data?.warga_id,
    period_start: new Date(data?.period_start),
    period_end: new Date(data?.period_end),
    number_of_period: data?.number_of_period,
    nominal: data?.nominal,
    payment_method: data?.payment_method,
    created_at: new Date(),
    updated_at: new Date(),
    _class: "Payment",
  }
  return payment
}

module.exports = { paymentEntity }

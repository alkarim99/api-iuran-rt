const { ObjectId } = require("mongodb")

class paymentEntity {
  constructor(data) {
    this._id = new ObjectId()
    this.warga = data?.warga
    this.period_start = new Date(data?.period_start)
    this.period_end = new Date(data?.period_end)
    this.number_of_period = data?.number_of_period
    this.nominal = data?.nominal
    this.payment_method = data?.payment_method
    this.pay_at = new Date(data?.pay_at)
    this.details_payment = data?.details_payment
    this.created_at = new Date()
    this.updated_at = new Date()
    this._class = "Payment"
  }
}

class detailsPaymentEntity {
  constructor(data) {
    this.rt = data?.rt
    this.pkk = data?.pkk
    this.sosial = data?.sosial
    this.kematian = data?.kematian
  }
}

module.exports = { paymentEntity, detailsPaymentEntity }

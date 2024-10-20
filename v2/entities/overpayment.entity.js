const { ObjectId } = require("mongodb")

class overpaymentEntity {
  constructor(data) {
    this._id = new ObjectId()
    this.warga = data?.warga
    this.period = new Date(data?.period)
    this.nominal = parseInt(data?.nominal) || 0
    this.payment_method = data?.payment_method
    this.pay_at = new Date(data?.pay_at)
    this.created_at = new Date()
    this.updated_at = new Date()
    this._class = "Overpayment"
  }
}

module.exports = { overpaymentEntity }

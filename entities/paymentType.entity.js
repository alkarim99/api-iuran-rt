const { ObjectId } = require("mongodb")

class paymentTypeEntity {
  constructor(data) {
    this._id = new ObjectId()
    this.name = data?.name
    this.nominal = parseInt(data?.nominal) || 0
    this.details = data?.details
    this.created_at = new Date()
    this.updated_at = new Date()
    this._class = "PaymentType"
  }
}

class detailsEntity {
  constructor(name, value) {
    this.name = name
    this.value = parseInt(value) || 0
  }
}

module.exports = { paymentTypeEntity, detailsEntity }

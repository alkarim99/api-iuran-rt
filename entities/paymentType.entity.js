const { ObjectId } = require("mongodb")

class paymentTypeEntity {
  constructor(data) {
    this._id = new ObjectId()
    this.name = data?.name
    this.details = new Array()
    this.created_at = new Date()
    this.updated_at = new Date()
    this._class = "PaymentType"
  }
}

class detailsEntity {
  constructor(name, value) {
    this.name = name;
    this.value = value
  }
}

module.exports = { paymentTypeEntity, detailsEntity }

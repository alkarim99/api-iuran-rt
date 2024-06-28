const { ObjectId } = require("mongodb")

// const paymentTypeEntity = (data) => {
//   const paymentType = {
//     _id: new ObjectId(),
//     name: data?.name,
//     details: new Array(),
//     created_at: new Date(),
//     updated_at: new Date(),
//     _class: "PaymentType",
//   }
//   return paymentType
// }

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

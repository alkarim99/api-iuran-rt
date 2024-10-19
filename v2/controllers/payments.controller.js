const { ObjectId } = require("mongodb")
const model = require("../../repositories/payments.repository")
const { collWarga } = require("../../config/database")
const { paymentEntity } = require("../../entities/payment.entity")
const { wargaDataEmbed } = require("../../entities/warga.entity")
const {
  idSchema,
  createSchema,
  updateSchema,
  filterSchema,
} = require("../../dto/payments/request")
const {
  getAllMonthsBetween,
  getNumberOfPeriods,
  getDetailsPayment,
} = require("../../helpers/payment.helper")

const create = async (req, res) => {
  try {
    const { error, value } = createSchema.validate(req?.body)
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      })
    }
    let data = value

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
  } catch (err) {
    console.error(err)
    res.status(500).send({
      status: false,
      message: "Error creating payment",
      error: err.message,
    })
  }
}

module.exports = {
  create,
}

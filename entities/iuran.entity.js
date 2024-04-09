const { ObjectId } = require("mongodb")

const iuranEntity = (data) => {
  const iuran = {
    _id: new ObjectId(),
    warga_id: new ObjectId(data?.warga_id),
    payment_id: new ObjectId(data?.payment_id),
    period: new Date(data?.period),
    nominal: data?.nominal,
    pay_at: new Date(data?.pay_at),
    created_at: new Date(),
    updated_at: new Date(),
    _class: "Iuran",
  }
  return iuran
}

module.exports = { iuranEntity }

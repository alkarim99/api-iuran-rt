const { ObjectId } = require("mongodb")

const wargaEntity = (data) => {
  const warga = {
    _id: new ObjectId(),
    name: data?.name,
    address: data?.address,
    created_at: new Date(),
    updated_at: new Date(),
    _class: "Warga",
  }
  return warga
}

module.exports = { wargaEntity }

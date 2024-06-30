const { ObjectId } = require("mongodb")

class wargaEntity {
  constructor(data) {
    this._id = new ObjectId()
    this.name = data?.name
    this.address = data?.address
    this.created_at = new Date()
    this.updated_at = new Date()
    this._class = "Warga"
  }
}

class wargaDataEmbed {
  constructor(data) {
    this._id = new ObjectId()
    this.name = data?.name
    this.address = data?.address
  }
}

module.exports = { wargaEntity, wargaDataEmbed }

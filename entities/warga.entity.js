const { ObjectId } = require("mongodb");

class WargaEntity {
  constructor(data) {
    this._id = new ObjectId();
    this.name = data?.name;
    this.address = data?.address;
    this.created_at = new Date();
    this.updated_at = new Date();
    this._class = "Warga";
  }
}

class WargaDataEmbed {
  constructor(data) {
    this._id = data?._id;
    this.name = data?.name;
    this.address = data?.address;
  }
}

module.exports = { WargaEntity, WargaDataEmbed };

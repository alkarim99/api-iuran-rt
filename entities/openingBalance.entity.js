const { ObjectId } = require("mongodb");

class OpeningBalanceEntity {
  constructor(data) {
    if (!data._id) {
      this._id = new ObjectId();
      this.created_at = new Date();
    } else {
      this._id = data._id;
      this.created_at = data.created_at;
    }
    
    this.year = parseInt(data.year);
    this.type = data.type; // "petty_cash" | "rekening"
    this.nominal = parseFloat(data.nominal || 0);
    this.note = data.note || "";
    this.updated_at = new Date();
    this._class = "OpeningBalance";
  }
}

module.exports = { OpeningBalanceEntity };

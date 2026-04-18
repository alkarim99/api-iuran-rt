const { ObjectId } = require("mongodb");

class ExpenseEntity {
  constructor(data) {
    this._id = new ObjectId();
    this.nominal = data?.nominal;
    this.transaction_at = new Date(data?.transaction_at);
    this.description = data?.description;
    this.payment_method = data?.payment_method || "cash"; // Defaulting to Cash
    this.created_at = new Date();
    this.updated_at = new Date();
    this._class = "Expense";
  }
}

module.exports = { ExpenseEntity };

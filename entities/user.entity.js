const { ObjectId } = require("mongodb")

class userEntity {
  constructor(data) {
    this._id = new ObjectId()
    this.name = data?.name
    this.email = data?.email
    this.password = data?.password
    this.role = data?.role
    this.created_at = new Date()
    this.updated_at = new Date()
    this._class = "User"
  }
}

module.exports = { userEntity }

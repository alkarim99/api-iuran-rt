class signUpResponse {
  constructor(data) {
    this._id = data?._id
    this.name = data?.name
    this.email = data?.email
    this.role = data?.role
    this.createdAt = data?.created_at
    this._class = "User"
  }
}

module.exports = { signUpResponse }

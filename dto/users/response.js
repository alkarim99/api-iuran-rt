class usersResponse {
  constructor(data) {
    this._id = data?._id
    this.name = data?.name
    this.email = data?.email
    this.role = data?.role
    this.createdAt = data?.created_at
  }
}

module.exports = { usersResponse }

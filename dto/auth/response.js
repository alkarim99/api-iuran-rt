class SignUpResponse {
  constructor(data) {
    this._id = data?._id;
    this.name = data?.name;
    this.email = data?.email;
    this.role = data?.role;
    this.createdAt = data?.created_at;
  }
}

class SignInResponse {
  constructor(data) {
    this._id = data?._id;
    this.name = data?.name;
    this.email = data?.email;
    this.role = data?.role;
  }
}

module.exports = { SignUpResponse, SignInResponse };

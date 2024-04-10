const { ObjectId } = require("mongodb")

const userEntity = (data) => {
  const user = {
    _id: new ObjectId(),
    name: data?.name,
    email: data?.email,
    password: data?.password,
    role: data?.role,
    created_at: new Date(),
    updated_at: new Date(),
    _class: "User",
  }
  return user
}

module.exports = { userEntity }

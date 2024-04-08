const model = require("../repositories/wargas.repository")

const getAll = async (req, res) => {
  const data = await model.getAll()
  res.send({
    status: true,
    message: "Get data success",
    data,
  })
}

module.exports = { getAll }

const endPointInvalid = (req, res) => {
  res.status(404).send({
    status: false,
    message: "Route Not Found",
  })
}

module.exports = endPointInvalid

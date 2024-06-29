require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")

const wargasRoutes = require("./routes/wargas.route")
const paymentsRoutes = require("./routes/payments.route")
const usersRoutes = require("./routes/users.route")
const authRoutes = require("./routes/auth.routes")
const invalidRoutes = require("./routes/404.route")

const helmet = require("helmet")
const xss = require("xss-clean")
const cors = require("cors")

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(helmet())
app.use(xss())

app.use(cors())

// Routes
app.use(wargasRoutes)
app.use(paymentsRoutes)
app.use(usersRoutes)
app.use(authRoutes)

// Home
app.get("/", (req, res) => {
  res.send(`API For Iuran RT ${process.env.NODE_ENV}`)
})

// Other routes
app.use(invalidRoutes)

app.listen(8000, () => {
  console.log("App running in port 8000")
  console.log(process.env.NODE_ENV)
})

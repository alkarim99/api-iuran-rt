require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const userRouter = require("./routes/users.route");
const authRouter = require("./routes/auth.route");
const wargaRouter = require("./routes/wargas.route");
const paymentRouter = require("./routes/payments.route");
const expenseRouter = require("./routes/expense.route");
const migrationRouter = require("./routes/migration.route");
const otherIncomeRouter = require("./routes/otherIncome.route");
const reportRouter = require("./routes/report.route");
const invalidRoutes = require("./routes/404.route");

const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(helmet());
app.use(xss());

app.use(cors());

// Routes
app.use("/api", authRouter);
app.use("/api", wargaRouter);
app.use("/api", paymentRouter);
app.use("/api", expenseRouter);
app.use("/api", migrationRouter);
app.use("/api", otherIncomeRouter);
app.use("/api", reportRouter);
app.use("/api", userRouter);

// Home
app.get("/", (req, res) => {
  res.send(`API For Iuran RT ${process.env.NODE_ENV}`);
});

// Other routes
app.use(invalidRoutes);

module.exports = app;

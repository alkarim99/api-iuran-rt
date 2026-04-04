const model = require("../repositories/dashboard.repository");
const {
  yearSchema,
  monthSchema,
  kasSummarySchema,
  tierBreakdownSchema,
} = require("../dto/dashboard/request");

const getTunggakan = async (req, res) => {
  try {
    const { error, value } = monthSchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const { month } = value;
    const data = await model.getTunggakan(month);
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const { error, value } = yearSchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const { year } = value;
    const data = await model.getMonthlySummary(year);
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const getPaymentHeatmap = async (req, res) => {
  try {
    const { error, value } = yearSchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const { year } = value;
    const data = await model.getPaymentHeatmap(year);
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const getTierBreakdown = async (req, res) => {
  try {
    const { error, value } = tierBreakdownSchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    // Jika month tidak ada, gunakan bulan saat ini
    const targetMonth =
      value.month || new Date().toISOString().substring(0, 7);
    // Extract year dari month (YYYY-MM) — tidak perlu param year terpisah
    const year = parseInt(targetMonth.split("-")[0], 10);

    const data = await model.getTierBreakdown(year, targetMonth);
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

const getKasSummary = async (req, res) => {
  try {
    const { error, value } = kasSummarySchema.validate(req?.query);
    if (error) {
      return res.status(400).send({
        status: false,
        message: error.details[0].message,
      });
    }

    const { month } = value;
    // Extract year dari month (YYYY-MM) — tidak perlu param year terpisah
    const year = parseInt(month.split("-")[0], 10);

    const data = await model.getKasSummary(month, year);
    res.send({
      status: true,
      message: "Get data success",
      ...data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: "Error fetching data",
      error: err.message,
    });
  }
};

module.exports = {
  getTunggakan,
  getMonthlySummary,
  getPaymentHeatmap,
  getTierBreakdown,
  getKasSummary,
};

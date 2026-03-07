const paymentRepo = require("../repositories/payments.repository");
const expenseRepo = require("../repositories/expense.repository");
const otherIncomeRepo = require("../repositories/otherIncome.repository");

// Helper to format date uniformly
const formatDate = (date) => new Date(date).toISOString().split("T")[0];

const buildReport = async (req, res, paymentMethodFilter = null) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).send({
        status: false,
        message: "start_date and end_date are required",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    end.setHours(23, 59, 59, 999); // Include entire end day

    // 1. Fetch Payments (Iuran)
    let paymentData = [];
    if (paymentMethodFilter) {
      paymentData = await paymentRepo.getByPaymentMethod(
        start,
        end,
        paymentMethodFilter,
      );
      paymentData = paymentData.data;
      console.log(paymentData);
    } else {
      // If no filter, fetch all within range. Reusing getByPayAt logic
      const payments = await paymentRepo.getByPayAt(
        start,
        end,
        "",
        "pay_at",
        1,
        1,
        10000,
      );
      paymentData = payments.data;
    }

    // 2. Fetch Other Incomes
    let otherIncomeData = await otherIncomeRepo.getByTransactionAt(
      start,
      end,
      "",
      "transaction_at",
      1,
      10000,
    );
    otherIncomeData = otherIncomeData.data;
    if (paymentMethodFilter) {
      const filterLower = paymentMethodFilter.toLowerCase();
      otherIncomeData = otherIncomeData.filter(
        (item) => (item.payment_method || "").toLowerCase() === filterLower,
      );
    }

    // 3. Fetch Expenses
    let expenseData = await expenseRepo.getByTransactionAt(
      start,
      end,
      "",
      "transaction_at",
      1,
      10000,
    );
    expenseData = expenseData.data;
    if (paymentMethodFilter) {
      const filterLower = paymentMethodFilter.toLowerCase();
      expenseData = expenseData.filter(
        (item) => (item.payment_method || "").toLowerCase() === filterLower,
      );
    }

    // 4. Combine and Sort all transactions
    let allTransactions = [];

    paymentData.forEach((p) => {
      allTransactions.push({
        date: formatDate(p.pay_at),
        timestamp: new Date(p.pay_at).getTime(),
        description: `Pembayaran Iuran Warga ${p.warga?.name || ""}`,
        debit: parseFloat(p.nominal),
        kredit: 0,
        type: "Iuran",
      });
    });

    otherIncomeData.forEach((oi) => {
      allTransactions.push({
        date: formatDate(oi.transaction_at),
        timestamp: new Date(oi.transaction_at).getTime(),
        description: oi.description,
        debit: parseFloat(oi.nominal),
        kredit: 0,
        type: "Pemasukan Lainnya",
      });
    });

    expenseData.forEach((e) => {
      allTransactions.push({
        date: formatDate(e.transaction_at),
        timestamp: new Date(e.transaction_at).getTime(),
        description: e.description,
        debit: 0,
        kredit: parseFloat(e.nominal),
        type: "Pengeluaran",
      });
    });

    allTransactions.sort((a, b) => a.timestamp - b.timestamp);

    // 5. Calculate Running Balance
    let runningBalance = 0;
    allTransactions = allTransactions.map((tx) => {
      runningBalance += tx.debit;
      runningBalance -= tx.kredit;
      const { timestamp, ...rest } = tx; // remove timestamp for clean output
      return {
        ...rest,
        saldo: runningBalance,
      };
    });

    res.send({
      status: true,
      data: allTransactions,
      total_transactions: allTransactions.length,
      final_balance: runningBalance,
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error generating report",
      error: err.message,
    });
  }
};

const getPettyCashReport = async (req, res) => {
  return await buildReport(req, res, "cash");
};

const getKasRekeningReport = async (req, res) => {
  return await buildReport(req, res, "transfer");
};

const getNeracaKasReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).send({
        status: false,
        message: "start_date and end_date are required",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    end.setHours(23, 59, 59, 999);

    const payments = await paymentRepo.getByPayAt(
      start,
      end,
      "",
      "pay_at",
      1,
      1,
      10000,
    );
    const otherIncomes = await otherIncomeRepo.getByTransactionAt(
      start,
      end,
      "",
      "transaction_at",
      1,
      10000,
    );
    const expenses = await expenseRepo.getByTransactionAt(
      start,
      end,
      "",
      "transaction_at",
      1,
      10000,
    );

    let transactions = [];

    // Phase 1: Pemasukan Lainnya
    let totalLainnya = 0;
    otherIncomes.data.forEach((oi) => {
      const nominal = parseFloat(oi.nominal);
      totalLainnya += nominal;
      transactions.push({
        id: oi._id || Math.random().toString(),
        tanggal: oi.transaction_at,
        description: oi.description,
        debit: nominal,
        credit: 0,
      });
    });

    // Phase 2: Pengeluaran
    let totalExpense = 0;
    expenses.data.forEach((e) => {
      const nominal = parseFloat(e.nominal);
      totalExpense += nominal;
      transactions.push({
        id: e._id || Math.random().toString(),
        tanggal: e.transaction_at,
        description: e.description,
        debit: 0,
        credit: nominal,
      });
    });

    // Sort Phase 1 and Phase 2 by timestamp
    transactions.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    // Phase 3: Recap Iuran Warga at the end of the month
    let totalIuran = 0;
    payments.data.forEach((p) => {
      const nominal = parseFloat(p.nominal);
      totalIuran += nominal;
    });

    if (totalIuran > 0) {
      transactions.push({
        id: `iuran_summary_${end.getTime()}`,
        tanggal: end.toISOString().split("T")[0],
        description: `Total Pemasukan Iuran Warga Bulan Ini`,
        debit: totalIuran,
        credit: 0,
      });
    }

    const totalIncome = Number((totalIuran + totalLainnya).toFixed(2));
    totalExpense = Number(totalExpense.toFixed(2));
    const netBalance = Number((totalIncome - totalExpense).toFixed(2));

    res.send({
      status: true,
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: netBalance,
        transactions: transactions,
      },
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error generating report",
      error: err.message,
    });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).send({
        status: false,
        message: "start_date and end_date are required",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    end.setHours(23, 59, 59, 999);

    const payments = await paymentRepo.getByPayAt(
      start,
      end,
      "",
      "pay_at",
      1,
      1,
      100000,
    );
    const otherIncomes = await otherIncomeRepo.getByTransactionAt(
      start,
      end,
      "",
      "transaction_at",
      1,
      100000,
    );
    const expenses = await expenseRepo.getByTransactionAt(
      start,
      end,
      "",
      "transaction_at",
      1,
      100000,
    );

    let totalLainnya = 0;
    otherIncomes.data.forEach((oi) => {
      totalLainnya += parseFloat(oi.nominal);
    });

    let totalExpense = 0;
    expenses.data.forEach((e) => {
      totalExpense += parseFloat(e.nominal);
    });

    let totalIuran = 0;
    payments.data.forEach((p) => {
      totalIuran += parseFloat(p.nominal);
    });

    const totalIncome = Number((totalIuran + totalLainnya).toFixed(2));
    totalExpense = Number(totalExpense.toFixed(2));
    const netBalance = Number((totalIncome - totalExpense).toFixed(2));

    res.send({
      status: true,
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: netBalance,
      },
    });
  } catch (err) {
    res.status(500).send({
      status: false,
      message: "Error generating dashboard summary",
      error: err.message,
    });
  }
};

module.exports = {
  getPettyCashReport,
  getKasRekeningReport,
  getNeracaKasReport,
  getDashboardSummary,
};

const paymentRepo = require("../repositories/payments.repository");
const expenseRepo = require("../repositories/expense.repository");
const otherIncomeRepo = require("../repositories/otherIncome.repository");
const openingBalanceRepo = require("../repositories/openingBalance.repository");

// Helper to format date uniformly
const formatDate = (date) => new Date(date).toISOString().split("T")[0];

const fetchTransactions = async (start, end, paymentMethodFilter) => {
  let paymentData = [];
  if (paymentMethodFilter) {
    paymentData = (await paymentRepo.getByPaymentMethod(start, end, paymentMethodFilter)).data;
  } else {
    paymentData = (await paymentRepo.getByPayAt(start, end, "", "pay_at", 1, 1, 10000)).data;
  }

  let otherIncomeData = (await otherIncomeRepo.getByTransactionAt(start, end, "", "transaction_at", 1, 10000)).data;
  if (paymentMethodFilter) {
    const filterLower = paymentMethodFilter.toLowerCase();
    otherIncomeData = otherIncomeData.filter((item) => (item.payment_method || "").toLowerCase() === filterLower);
  }

  let expenseData = (await expenseRepo.getByTransactionAt(start, end, "", "transaction_at", 1, 10000)).data;
  if (paymentMethodFilter) {
    const filterLower = paymentMethodFilter.toLowerCase();
    expenseData = expenseData.filter((item) => (item.payment_method || "").toLowerCase() === filterLower);
  }

  let allTransactions = [];
  let totalDebit = 0;
  let totalKredit = 0;

  paymentData.forEach((p) => {
    const nom = parseFloat(p.nominal);
    totalDebit += nom;
    allTransactions.push({
      date: formatDate(p.pay_at),
      timestamp: new Date(p.pay_at).getTime(),
      description: `Pembayaran Iuran Warga ${p.warga?.name || ""}`,
      debit: nom,
      kredit: 0,
      type: "Iuran",
    });
  });

  otherIncomeData.forEach((oi) => {
    const nom = parseFloat(oi.nominal);
    totalDebit += nom;
    allTransactions.push({
      date: formatDate(oi.transaction_at),
      timestamp: new Date(oi.transaction_at).getTime(),
      description: oi.description,
      debit: nom,
      kredit: 0,
      type: "Pemasukan Lainnya",
    });
  });

  expenseData.forEach((e) => {
    const nom = parseFloat(e.nominal);
    totalKredit += nom;
    allTransactions.push({
      date: formatDate(e.transaction_at),
      timestamp: new Date(e.transaction_at).getTime(),
      description: e.description,
      debit: 0,
      kredit: nom,
      type: "Pengeluaran",
    });
  });

  allTransactions.sort((a, b) => a.timestamp - b.timestamp);

  return { allTransactions, totalDebit, totalKredit };
};

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
    end.setHours(23, 59, 59, 999);

    // Calculate carry-over balance (Saldo Awal for requested period)
    const year = start.getFullYear();
    const typeOpBal = paymentMethodFilter === "cash" ? "petty_cash" : "rekening";
    const opBalDoc = await openingBalanceRepo.getOne(year, typeOpBal);
    let carryOverBalance = opBalDoc ? opBalDoc.nominal : 0;

    const jan1 = new Date(year, 0, 1);
    if (start > jan1) {
      const preStart = new Date(start.getTime() - 1);
      const preData = await fetchTransactions(jan1, preStart, paymentMethodFilter);
      carryOverBalance += preData.totalDebit - preData.totalKredit;
    }

    let { allTransactions } = await fetchTransactions(start, end, paymentMethodFilter);

    // 5. Calculate Running Balance
    let runningBalance = carryOverBalance;
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
      saldo_awal: carryOverBalance,
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

    // Calculate carry-over balance (Saldo Awal for requested period)
    const year = start.getFullYear();
    const opBalPetty = await openingBalanceRepo.getOne(year, "petty_cash");
    const opBalRekening = await openingBalanceRepo.getOne(year, "rekening");
    
    let carryOverBalance = 0;
    if (opBalPetty) carryOverBalance += opBalPetty.nominal;
    if (opBalRekening) carryOverBalance += opBalRekening.nominal;

    const jan1 = new Date(year, 0, 1);
    if (start > jan1) {
      const preStart = new Date(start.getTime() - 1);
      const preData = await fetchTransactions(jan1, preStart); // No filter for Neraca
      carryOverBalance += preData.totalDebit - preData.totalKredit;
    }

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
        saldo_awal: carryOverBalance,
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

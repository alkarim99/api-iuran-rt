const {
  collPayment,
  collWarga,
  collExpense,
  collOtherIncome,
  collOpeningBalance,
} = require("../config/database");

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
];

/**
 * Parse "YYYY-MM" string → { year, month } as Numbers.
 */
const parseYearMonth = (str) => {
  const [year, month] = str.split("-").map(Number);
  return { year, month };
};

/**
 * Buat Date awal bulan (hari pertama, jam 00:00:00.000).
 */
const firstDayOf = (year, month) => new Date(year, month - 1, 1);

/**
 * Buat Date akhir bulan (hari terakhir, jam 23:59:59.999).
 * new Date(year, month, 0) → hari terakhir bulan sebelumnya, yaitu bulan target.
 */
const lastDayOf = (year, month) => new Date(year, month, 0, 23, 59, 59, 999);

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 1 — GET /api/dashboard/tunggakan
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX #1: collWarga dan collPayment beda DB → $lookup lintas-DB tidak didukung.
 *         Solusi: query terpisah lalu join di aplikasi.
 * FIX #2: warga_id project dari $project sudah aman (MongoDB evaluasi dari
 *         input doc), tapi untuk kejelasan kita tangani di JS saja.
 */
const getTunggakan = async (targetMonth) => {
  try {
    const { year, month } = parseYearMonth(targetMonth);
    const firstDay = firstDayOf(year, month);
    const lastDay = lastDayOf(year, month);

    // Step 1: Ambil semua warga
    const allWarga = await collWarga
      .find({}, { projection: { _id: 1, name: 1, address: 1 } })
      .toArray();

    const totalWarga = allWarga.length;

    // Step 2: Cari warga._id yang SUDAH punya payment mencakup bulan target
    const paidWargaIds = await collPayment.distinct("warga._id", {
      period_start: { $lte: lastDay },
      period_end: { $gte: firstDay },
    });

    // Konversi ke Set of string untuk lookup O(1)
    const paidIdSet = new Set(paidWargaIds.map((id) => id.toString()));

    // Step 3: Filter warga yang BELUM bayar (tunggakan)
    const tunggakanWarga = allWarga.filter(
      (w) => !paidIdSet.has(w._id.toString()),
    );

    if (tunggakanWarga.length === 0) {
      return {
        status: "success",
        month: targetMonth,
        total_warga: totalWarga,
        total_tunggakan: 0,
        potensi_nominal: 0,
        data: [],
      };
    }

    // Step 4: Ambil payment terakhir untuk masing-masing warga tunggakan
    //         dalam 1 batch query (bukan N+1)
    const tunggakanIds = tunggakanWarga.map((w) => w._id);
    const lastPayments = await collPayment
      .aggregate([
        { $match: { "warga._id": { $in: tunggakanIds } } },
        { $sort: { period_end: -1 } },
        {
          $group: {
            _id: "$warga._id",
            last_payment: { $first: "$$ROOT" },
          },
        },
      ])
      .toArray();

    // Map warga._id → last_payment
    const lastPaymentMap = new Map(
      lastPayments.map((lp) => [lp._id.toString(), lp.last_payment]),
    );

    // Step 5a: Cari modus nominal per bulan dari data pembayaran existing
    const modeResult = await collPayment
      .aggregate([
        {
          $project: {
            nominal_per_month: { $divide: ["$nominal", "$number_of_period"] },
          },
        },
        { $group: { _id: "$nominal_per_month", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();
    const defaultNominal =
      modeResult.length > 0 ? modeResult[0]._id : 110000;

    // Step 5b: Hitung bulan nunggak & potensi nominal
    const data = tunggakanWarga.map((w) => {
      const lastPay = lastPaymentMap.get(w._id.toString());

      if (!lastPay) {
        // Belum pernah bayar sama sekali — pakai modus nominal warga lain
        return {
          warga_id: w._id,
          name: w.name,
          address: w.address,
          bulan_nunggak: 1,
          potensi_nominal: defaultNominal,
          last_payment_period: null,
        };
      }

      const lastEnd = new Date(lastPay.period_end);
      // Hitung selisih bulan antara period_end terakhir dengan bulan target
      const diffMonths =
        (year - lastEnd.getFullYear()) * 12 +
        (month - (lastEnd.getMonth() + 1));

      const bulan_nunggak = diffMonths > 0 ? diffMonths : 1;
      const potensi_nominal = lastPay.nominal / lastPay.number_of_period;
      const last_payment_period = lastEnd.toISOString().substring(0, 7);

      return {
        warga_id: w._id,
        name: w.name,
        address: w.address,
        bulan_nunggak,
        potensi_nominal,
        last_payment_period,
      };
    });

    const total_potensi = data.reduce(
      (acc, curr) => acc + curr.potensi_nominal * curr.bulan_nunggak,
      0,
    );

    return {
      status: "success",
      month: targetMonth,
      total_warga: totalWarga,
      total_tunggakan: data.length,
      potensi_nominal: total_potensi,
      data,
    };
  } catch (err) {
    console.error("Error getTunggakan:", err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 2 — GET /api/dashboard/monthly-summary
// ─────────────────────────────────────────────────────────────────────────────

const getMonthlySummary = async (year) => {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    // Aggregate income per bulan + method dalam 1 pipeline
    const paymentAgg = await collPayment
      .aggregate([
        { $match: { pay_at: { $gte: startOfYear, $lte: endOfYear } } },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: "%Y-%m", date: "$pay_at" } },
              method: "$payment_method",
            },
            total: { $sum: "$nominal" },
          },
        },
      ])
      .toArray();

    // Aggregate expense per bulan dalam 1 pipeline
    const expenseAgg = await collExpense
      .aggregate([
        {
          $match: {
            transaction_at: { $gte: startOfYear, $lte: endOfYear },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$transaction_at" } },
            total: { $sum: "$nominal" },
          },
        },
      ])
      .toArray();

    // Bangun 12 bulan dengan nilai default 0
    const data = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthStr = `${year}-${m.toString().padStart(2, "0")}`;

      const incomeCash =
        paymentAgg.find(
          (p) => p._id.month === monthStr && p._id.method === "cash",
        )?.total || 0;
      const incomeTransfer =
        paymentAgg.find(
          (p) => p._id.month === monthStr && p._id.method === "transfer",
        )?.total || 0;
      const pengeluaran =
        expenseAgg.find((e) => e._id === monthStr)?.total || 0;

      return {
        month: monthStr,
        month_label: MONTH_LABELS[i],
        pemasukan_cash: incomeCash,
        pemasukan_transfer: incomeTransfer,
        pemasukan_total: incomeCash + incomeTransfer,
        pengeluaran,
        net: incomeCash + incomeTransfer - pengeluaran,
      };
    });

    return {
      status: "success",
      year,
      data,
    };
  } catch (err) {
    console.error("Error getMonthlySummary:", err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 3 — GET /api/dashboard/payment-heatmap
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX #6 (Performance): Ganti 12x sequential distinct → 12 query paralel
 *                        dengan Promise.all.
 */
const getPaymentHeatmap = async (year) => {
  try {
    const totalWarga = await collWarga.countDocuments({});

    // Jalankan semua 12 distinct query secara paralel
    const monthPromises = Array.from({ length: 12 }, (_, i) => {
      const firstDay = new Date(year, i, 1);
      const lastDay = new Date(year, i + 1, 0, 23, 59, 59, 999);
      return collPayment.distinct("warga._id", {
        period_start: { $lte: lastDay },
        period_end: { $gte: firstDay },
      });
    });

    const results = await Promise.all(monthPromises);

    const data = results.map((uniqueIds, i) => {
      const m = i + 1;
      const monthStr = `${year}-${m.toString().padStart(2, "0")}`;
      const jumlah_bayar = uniqueIds.length;
      return {
        month: monthStr,
        month_label: MONTH_LABELS[i],
        jumlah_bayar,
        persentase:
          totalWarga > 0
            ? parseFloat(((jumlah_bayar / totalWarga) * 100).toFixed(1))
            : 0,
      };
    });

    return {
      status: "success",
      year,
      total_warga: totalWarga,
      data,
    };
  } catch (err) {
    console.error("Error getPaymentHeatmap:", err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 4 — GET /api/dashboard/tier-breakdown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX #6 (Performance): Compliance trend 12 query → Promise.all.
 * FIX #7 (Logic):       Tier 1 = nominal % 75000 === 0 (bukan === 75000).
 *                        Tier 2 = nominal % 110000 === 0 (bukan === 110000).
 *                        Custom = selainnya.
 */
const getTierBreakdown = async (year, targetMonth) => {
  try {
    const totalWarga = await collWarga.countDocuments({});

    // 1. Tier Breakdown untuk bulan spesifik
    const { year: tYear, month: tMonth } = parseYearMonth(targetMonth);
    const firstDay = firstDayOf(tYear, tMonth);
    const lastDay = lastDayOf(tYear, tMonth);

    const payments = await collPayment
      .find(
        { period_start: { $lte: lastDay }, period_end: { $gte: firstDay } },
        { projection: { nominal: 1, number_of_period: 1 } },
      )
      .toArray();

    const tier_counts = { tier1: 0, tier2: 0, custom: 0 };

    payments.forEach((p) => {
      const nominalPerBulan = p.nominal / p.number_of_period;
      // FIX: sesuai spesifikasi → % 75000 === 0 = Tier 1
      if (nominalPerBulan % 75000 === 0) {
        tier_counts.tier1++;
      } else if (nominalPerBulan % 110000 === 0) {
        tier_counts.tier2++;
      } else {
        tier_counts.custom++;
      }
    });

    const pct = (count) =>
      totalWarga > 0
        ? parseFloat(((count / totalWarga) * 100).toFixed(1))
        : 0;

    const tier_breakdown = {
      tier1: { label: "Rp 75.000", jumlah: tier_counts.tier1, persentase: pct(tier_counts.tier1) },
      tier2: { label: "Rp 110.000", jumlah: tier_counts.tier2, persentase: pct(tier_counts.tier2) },
      custom: { label: "Custom", jumlah: tier_counts.custom, persentase: pct(tier_counts.custom) },
    };

    // 2. Compliance Trend (12 bulan) — jalankan paralel
    const trendPromises = Array.from({ length: 12 }, (_, i) => {
      const firstDayM = new Date(year, i, 1);
      const lastDayM = new Date(year, i + 1, 0, 23, 59, 59, 999);
      return collPayment.distinct("warga._id", {
        period_start: { $lte: lastDayM },
        period_end: { $gte: firstDayM },
      });
    });

    const trendResults = await Promise.all(trendPromises);

    const compliance_trend = trendResults.map((uniqueIds, i) => {
      const m = i + 1;
      return {
        month: `${year}-${m.toString().padStart(2, "0")}`,
        month_label: MONTH_LABELS[i],
        persentase:
          totalWarga > 0
            ? parseFloat(((uniqueIds.length / totalWarga) * 100).toFixed(1))
            : 0,
      };
    });

    return {
      status: "success",
      period: { year, month: targetMonth },
      tier_breakdown,
      compliance_trend,
    };
  } catch (err) {
    console.error("Error getTierBreakdown:", err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Endpoint 5 — GET /api/dashboard/kas-summary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX #5: Filter semua transaksi mulai dari awal tahun (bukan dari awal waktu)
 *         agar konsisten dengan opening_balance yang per-tahun.
 */
const getKasSummary = async (targetMonth, year) => {
  try {
    const { month: tMonth } = parseYearMonth(targetMonth);

    const startOfYear = new Date(year, 0, 1);
    const endOfMonth = lastDayOf(year, tMonth);

    // Ambil opening balance untuk tahun yang diminta
    const [opBalPetty, opBalRekening] = await Promise.all([
      collOpeningBalance.findOne({ year, type: "petty_cash" }),
      collOpeningBalance.findOne({ year, type: "rekening" }),
    ]);

    const openPetty = opBalPetty?.nominal || 0;
    const openRekening = opBalRekening?.nominal || 0;

    // Aggregate payments dari awal tahun s/d akhir bulan target
    const [paymentAgg, otherAgg, expenseAgg] = await Promise.all([
      collPayment
        .aggregate([
          { $match: { pay_at: { $gte: startOfYear, $lte: endOfMonth } } },
          {
            $group: {
              _id: "$payment_method",
              total: { $sum: "$nominal" },
            },
          },
        ])
        .toArray(),

      collOtherIncome
        .aggregate([
          {
            $match: {
              transaction_at: { $gte: startOfYear, $lte: endOfMonth },
            },
          },
          {
            $group: {
              _id: "$payment_method",
              total: { $sum: "$nominal" },
            },
          },
        ])
        .toArray(),

      collExpense
        .aggregate([
          {
            $match: {
              transaction_at: { $gte: startOfYear, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$nominal" } } },
        ])
        .toArray(),
    ]);

    const findTotal = (arr, key) =>
      arr.find((x) => x._id === key)?.total || 0;

    const payCash = findTotal(paymentAgg, "cash");
    const payTransfer = findTotal(paymentAgg, "transfer");
    const otherCash = findTotal(otherAgg, "cash");
    const otherTransfer = findTotal(otherAgg, "transfer");
    const totalExpense = expenseAgg[0]?.total || 0;

    const saldoPetty = openPetty + payCash + otherCash - totalExpense;
    const saldoRekening = openRekening + payTransfer + otherTransfer;
    const totalSaldo = saldoPetty + saldoRekening;

    const pct = (val) =>
      totalSaldo > 0
        ? parseFloat(((val / totalSaldo) * 100).toFixed(1))
        : 0;

    return {
      status: "success",
      period: targetMonth,
      petty_cash: {
        opening_balance: openPetty,
        total_pemasukan_cash: payCash + otherCash,
        total_pengeluaran: totalExpense,
        saldo: saldoPetty,
      },
      kas_rekening: {
        opening_balance: openRekening,
        total_pemasukan_transfer: payTransfer + otherTransfer,
        saldo: saldoRekening,
      },
      total_saldo: totalSaldo,
      komposisi: {
        petty_cash_pct: pct(saldoPetty),
        rekening_pct: pct(saldoRekening),
      },
    };
  } catch (err) {
    console.error("Error getKasSummary:", err);
    throw err;
  }
};

module.exports = {
  getTunggakan,
  getMonthlySummary,
  getPaymentHeatmap,
  getTierBreakdown,
  getKasSummary,
};

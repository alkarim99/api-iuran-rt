/**
 * Unit Tests for payment.helper.js
 * These are pure function tests — no DB or HTTP required.
 */
const {
  getNumberOfPeriods,
  getDetailsPayment,
  getAllMonthsBetween,
} = require("../../helpers/payment.helper");

describe("Payment Helper Functions", () => {
  // ─── getNumberOfPeriods ────────────────────────────────────

  describe("getNumberOfPeriods", () => {
    it("should return 1 for same month", () => {
      const data = {
        period_start: "2024-01-01",
        period_end: "2024-01-31",
      };
      const result = getNumberOfPeriods(data);
      expect(result.number_of_period).toBe(1);
    });

    it("should return 3 for Jan-March", () => {
      const data = {
        period_start: "2024-01-01",
        period_end: "2024-03-31",
      };
      const result = getNumberOfPeriods(data);
      expect(result.number_of_period).toBe(3);
    });

    it("should return 12 for full year", () => {
      const data = {
        period_start: "2024-01-01",
        period_end: "2024-12-31",
      };
      const result = getNumberOfPeriods(data);
      expect(result.number_of_period).toBe(12);
    });

    it("should handle cross-year periods", () => {
      const data = {
        period_start: "2023-11-01",
        period_end: "2024-02-28",
      };
      const result = getNumberOfPeriods(data);
      expect(result.number_of_period).toBe(4); // Nov, Dec, Jan, Feb
    });
  });

  // ─── getDetailsPayment ─────────────────────────────────────

  describe("getDetailsPayment", () => {
    it("should calculate RT-only tier (75000/month)", () => {
      const data = {
        nominal: 75000,
        number_of_period: 1,
      };
      const result = getDetailsPayment(data);

      expect(result.details_payment.rt).toBe(75000);
      expect(result.details_payment.pkk).toBe(0);
      expect(result.details_payment.sosial).toBe(0);
      expect(result.details_payment.kematian).toBe(0);
    });

    it("should calculate RT-only tier for 3 months", () => {
      const data = {
        nominal: 225000, // 75000 * 3
        number_of_period: 3,
      };
      const result = getDetailsPayment(data);

      expect(result.details_payment.rt).toBe(225000); // 75000 * 3
      expect(result.details_payment.pkk).toBe(0);
    });

    it("should calculate full tier (110000/month)", () => {
      const data = {
        nominal: 110000,
        number_of_period: 1,
      };
      const result = getDetailsPayment(data);

      expect(result.details_payment.rt).toBe(94500);
      expect(result.details_payment.pkk).toBe(8000);
      expect(result.details_payment.sosial).toBe(2500);
      expect(result.details_payment.kematian).toBe(5000);
    });

    it("should calculate full tier for 2 months", () => {
      const data = {
        nominal: 220000,
        number_of_period: 2,
      };
      const result = getDetailsPayment(data);

      expect(result.details_payment.rt).toBe(189000); // 94500 * 2
      expect(result.details_payment.pkk).toBe(16000); // 8000 * 2
      expect(result.details_payment.sosial).toBe(5000); // 2500 * 2
      expect(result.details_payment.kematian).toBe(10000); // 5000 * 2
    });
  });

  // ─── getAllMonthsBetween ───────────────────────────────────

  describe("getAllMonthsBetween", () => {
    it("should return 1 month for same month period", () => {
      const data = {
        period_start: "2024-01-01",
        period_end: "2024-01-31",
        nominal: 75000,
        number_of_period: 1,
        pay_at: "2024-01-15",
        created_at: new Date(),
      };
      const result = getAllMonthsBetween(data);
      expect(result.length).toBe(1);
      expect(result[0].period).toContain("2024");
    });

    it("should return 3 months for Jan-March", () => {
      const data = {
        period_start: "2024-01-01",
        period_end: "2024-03-31",
        nominal: 225000,
        number_of_period: 3,
        pay_at: "2024-01-15",
        created_at: new Date(),
      };
      const result = getAllMonthsBetween(data);
      expect(result.length).toBe(3);
    });

    it("should split nominal evenly across months", () => {
      const data = {
        period_start: "2024-01-01",
        period_end: "2024-03-31",
        nominal: 225000,
        number_of_period: 3,
        pay_at: "2024-01-15",
        created_at: new Date(),
      };
      const result = getAllMonthsBetween(data);
      result.forEach((month) => {
        expect(month.nominal).toBe(75000); // 225000 / 3
      });
    });
  });
});

const request = require("supertest");
const app = require("../../app");
const { getAdminToken, cleanDatabase } = require("../helpers");

describe("Payments Endpoints", () => {
  let adminToken;
  let testWargaId;

  beforeAll(() => {
    adminToken = getAdminToken();
  });

  beforeEach(async () => {
    // Create a warga to attach payments to
    const wargaRes = await request(app)
      .post("/wargas")
      .set("Authorization", adminToken)
      .send({ name: "Budi Santoso", address: "Blok A-1" });

    testWargaId = wargaRes.body.insertedId;
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  // ─── CREATE ────────────────────────────────────────────────

  describe("POST /payments", () => {
    const getPaymentData = (wargaId) => ({
      warga_id: wargaId,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      nominal: 110000,
      payment_method: "cash",
      pay_at: "2024-01-15",
    });

    it("should create a payment successfully", async () => {
      const res = await request(app)
        .post("/payments")
        .set("Authorization", adminToken)
        .send(getPaymentData(testWargaId));

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("insertedId");
    });

    it("should calculate tier pricing (full tier: 110000)", async () => {
      // Create payment
      const createRes = await request(app)
        .post("/payments")
        .set("Authorization", adminToken)
        .send(getPaymentData(testWargaId));

      const paymentId = createRes.body.insertedId;

      // Verify payment details
      const getRes = await request(app)
        .get(`/payments/${paymentId}`)
        .set("Authorization", adminToken);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.details_payment.rt).toBe(94500);
      expect(getRes.body.data.details_payment.pkk).toBe(8000);
      expect(getRes.body.data.details_payment.sosial).toBe(2500);
      expect(getRes.body.data.details_payment.kematian).toBe(5000);
    });

    it("should calculate RT-only tier (75000)", async () => {
      const data = {
        ...getPaymentData(testWargaId),
        nominal: 75000,
      };

      const createRes = await request(app)
        .post("/payments")
        .set("Authorization", adminToken)
        .send(data);

      const paymentId = createRes.body.insertedId;

      const getRes = await request(app)
        .get(`/payments/${paymentId}`)
        .set("Authorization", adminToken);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.details_payment.rt).toBe(75000);
      expect(getRes.body.data.details_payment.pkk).toBe(0);
    });

    it("should embed warga data in payment", async () => {
      const createRes = await request(app)
        .post("/payments")
        .set("Authorization", adminToken)
        .send(getPaymentData(testWargaId));

      const paymentId = createRes.body.insertedId;

      const getRes = await request(app)
        .get(`/payments/${paymentId}`)
        .set("Authorization", adminToken);

      expect(getRes.body.data.warga.name).toBe("Budi Santoso");
      expect(getRes.body.data.warga.address).toBe("Blok A-1");
    });
  });

  // ─── GET ALL ───────────────────────────────────────────────

  describe("GET /payments", () => {
    it("should return paginated list", async () => {
      const res = await request(app)
        .get("/payments?page=1&limit=10")
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("currentPage");
      expect(res.body).toHaveProperty("totalPages");
      expect(res.body).toHaveProperty("data");
    });
  });

  // ─── GET BY ID ─────────────────────────────────────────────

  describe("GET /payments/:id", () => {
    it("should return payment by ID", async () => {
      const createRes = await request(app)
        .post("/payments")
        .set("Authorization", adminToken)
        .send({
          warga_id: testWargaId,
          period_start: "2024-01-01",
          period_end: "2024-01-31",
          nominal: 110000,
          payment_method: "cash",
          pay_at: "2024-01-15",
        });

      const id = createRes.body.insertedId;

      const res = await request(app)
        .get(`/payments/${id}`)
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.warga.name).toBe("Budi Santoso");
    });
  });

  // ─── DELETE ────────────────────────────────────────────────

  describe("DELETE /payments/:id", () => {
    it("should delete payment", async () => {
      const createRes = await request(app)
        .post("/payments")
        .set("Authorization", adminToken)
        .send({
          warga_id: testWargaId,
          period_start: "2024-01-01",
          period_end: "2024-01-31",
          nominal: 110000,
          payment_method: "cash",
          pay_at: "2024-01-15",
        });

      const id = createRes.body.insertedId;

      const res = await request(app)
        .delete(`/payments/${id}`)
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });
});

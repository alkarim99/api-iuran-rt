const request = require("supertest");
const app = require("../../app");
const { getAdminToken, getUserToken, cleanDatabase } = require("../helpers");

describe("Wargas Endpoints", () => {
  let adminToken;

  beforeAll(() => {
    adminToken = getAdminToken();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  // ─── CREATE ────────────────────────────────────────────────

  describe("POST /wargas", () => {
    it("should create a new warga", async () => {
      const res = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Budi Santoso", address: "Blok A-1" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body).toHaveProperty("insertedId");
    });

    it("should reject without name", async () => {
      const res = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ address: "Blok A-1" });

      expect(res.status).toBe(400);
    });

    it("should reject without address", async () => {
      const res = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Budi Santoso" });

      expect(res.status).toBe(400);
    });

    it("should reject duplicate address", async () => {
      await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Budi Santoso", address: "Blok A-1" });

      const res = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Siti Aminah", address: "Blok A-1" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Duplicate address");
    });

    it("should reject non-admin user", async () => {
      const userToken = getUserToken();
      const res = await request(app)
        .post("/wargas")
        .set("Authorization", userToken)
        .send({ name: "Budi Santoso", address: "Blok A-1" });

      expect(res.status).toBe(403);
    });
  });

  // ─── GET ALL ───────────────────────────────────────────────

  describe("GET /wargas", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post("/wargas")
          .set("Authorization", adminToken)
          .send({ name: `Warga ${i}`, address: `Blok A-${i}` });
      }
    });

    it("should return paginated list", async () => {
      const res = await request(app)
        .get("/wargas?page=1&limit=3")
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
      expect(res.body).toHaveProperty("totalCount");
      expect(res.body).toHaveProperty("currentPage");
    });

    it("should search by keyword", async () => {
      const res = await request(app)
        .get("/wargas?keyword=Warga 1")
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── GET BY ID ─────────────────────────────────────────────

  describe("GET /wargas/:id", () => {
    it("should return warga by ID", async () => {
      const createRes = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Budi Santoso", address: "Blok A-1" });

      const id = createRes.body.insertedId;

      const res = await request(app)
        .get(`/wargas/${id}`)
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Budi Santoso");
    });
  });

  // ─── UPDATE ────────────────────────────────────────────────

  describe("PATCH /wargas", () => {
    it("should update warga data", async () => {
      const createRes = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Budi Santoso", address: "Blok A-1" });

      const id = createRes.body.insertedId;

      const res = await request(app)
        .patch("/wargas")
        .set("Authorization", adminToken)
        .send({ id, name: "Budi Updated", address: "Blok A-1" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });
  });

  // ─── DELETE ────────────────────────────────────────────────

  describe("DELETE /wargas/:id", () => {
    it("should delete warga", async () => {
      const createRes = await request(app)
        .post("/wargas")
        .set("Authorization", adminToken)
        .send({ name: "Budi Santoso", address: "Blok A-1" });

      const id = createRes.body.insertedId;

      const res = await request(app)
        .delete(`/wargas/${id}`)
        .set("Authorization", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
    });

    it("should fail for non-existent ID", async () => {
      const res = await request(app)
        .delete("/wargas/000000000000000000000099")
        .set("Authorization", adminToken);

      expect(res.status).toBe(404);
    });
  });
});

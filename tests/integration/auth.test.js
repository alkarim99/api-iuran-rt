const request = require("supertest");
const app = require("../../app");
const { getAdminToken, cleanDatabase } = require("../helpers");
const { collUser } = require("../../config/database");

describe("Auth Endpoints", () => {
  let adminToken;

  beforeAll(() => {
    adminToken = getAdminToken();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  // ─── SIGN UP ───────────────────────────────────────────────

  describe("POST /auth/signup", () => {
    const validUser = {
      name: "Test User",
      email: "testuser@test.com",
      password: "password123",
      role: "admin",
    };

    it("should create a new user successfully", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .set("Authorization", adminToken)
        .send(validUser);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.message).toBe("User created successfully");
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data.name).toBe(validUser.name);
      expect(res.body.data.email).toBe(validUser.email);
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should reject duplicate email", async () => {
      // Create first user
      await request(app)
        .post("/auth/signup")
        .set("Authorization", adminToken)
        .send(validUser);

      // Try duplicate
      const res = await request(app)
        .post("/auth/signup")
        .set("Authorization", adminToken)
        .send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
      expect(res.body.message).toBe("Email already exists.");
    });

    it("should reject invalid email format", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .set("Authorization", adminToken)
        .send({ ...validUser, email: "invalid-email" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe(false);
    });

    it("should reject without auth token", async () => {
      const res = await request(app).post("/auth/signup").send(validUser);

      expect(res.status).toBe(401);
    });
  });

  // ─── SIGN IN ───────────────────────────────────────────────

  describe("POST /auth/signin", () => {
    beforeEach(async () => {
      // Create a user to sign in with
      await request(app)
        .post("/auth/signup")
        .set("Authorization", adminToken)
        .send({
          name: "Login User",
          email: "login@test.com",
          password: "password123",
          role: "admin",
        });
    });

    it("should sign in successfully with correct credentials", async () => {
      const res = await request(app).post("/auth/signin").send({
        email: "login@test.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.message).toBe("Sign In Success!");
      expect(res.body).toHaveProperty("token");
      expect(res.body.data.email).toBe("login@test.com");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("should reject wrong password", async () => {
      const res = await request(app).post("/auth/signin").send({
        email: "login@test.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Wrong email and password combination!");
    });

    it("should reject unregistered email", async () => {
      const res = await request(app).post("/auth/signin").send({
        email: "nonexistent@test.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Account not registered!");
    });

    it("should return JWT token with expiry", async () => {
      const res = await request(app).post("/auth/signin").send({
        email: "login@test.com",
        password: "password123",
      });

      const decoded = require("jsonwebtoken").decode(res.body.token);
      expect(decoded).toHaveProperty("exp");
      expect(decoded).not.toHaveProperty("password");
      expect(decoded.email).toBe("login@test.com");
    });
  });
});

const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../index")
const User = require("../models/User")

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/bugbounty-test"
    await mongoose.connect(mongoUri)
  })

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Test123!",
        role: "researcher",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body.message).toBe("User registered successfully")
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.password).toBeUndefined()
    })

    it("should not register user with invalid email", async () => {
      const userData = {
        username: "testuser",
        email: "invalid-email",
        password: "Test123!",
        role: "researcher",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.error).toBe("Validation failed")
    })

    it("should not register user with weak password", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "123",
        role: "researcher",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.error).toBe("Validation failed")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "Test123!",
        role: "researcher",
      })
      await user.save()
    })

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "Test123!",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(200)

      expect(response.body.message).toBe("Login successful")
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(loginData.email)
    })

    it("should not login with invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body.error).toBe("Invalid credentials")
    })
  })
})

const request = require("supertest")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const app = require("../index")
const User = require("../models/User")
const Bounty = require("../models/Bounty")

describe("Bounty Endpoints", () => {
  let companyUser, companyToken, researcherUser, researcherToken

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/bugbounty-test"
    await mongoose.connect(mongoUri)
  })

  beforeEach(async () => {
    await User.deleteMany({})
    await Bounty.deleteMany({})

    // Create test users
    companyUser = new User({
      username: "testcompany",
      email: "company@test.com",
      password: "Test123!",
      role: "company",
    })
    await companyUser.save()

    researcherUser = new User({
      username: "testresearcher",
      email: "researcher@test.com",
      password: "Test123!",
      role: "researcher",
    })
    await researcherUser.save()

    // Generate tokens
    companyToken = jwt.sign(
      { userId: companyUser._id, role: companyUser.role },
      process.env.JWT_SECRET || "test-secret",
    )

    researcherToken = jwt.sign(
      { userId: researcherUser._id, role: researcherUser.role },
      process.env.JWT_SECRET || "test-secret",
    )
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe("POST /api/bounties", () => {
    it("should create bounty as company user", async () => {
      const bountyData = {
        title: "Test Bounty",
        description: "This is a test bounty for security testing",
        reward: {
          min: 100,
          max: 1000,
        },
        severity: "medium",
        scope: {
          domains: ["test.com"],
        },
      }

      const response = await request(app)
        .post("/api/bounties")
        .set("Authorization", `Bearer ${companyToken}`)
        .send(bountyData)
        .expect(201)

      expect(response.body.message).toBe("Bounty created successfully")
      expect(response.body.bounty.title).toBe(bountyData.title)
    })

    it("should not create bounty as researcher", async () => {
      const bountyData = {
        title: "Test Bounty",
        description: "This is a test bounty for security testing",
        reward: {
          min: 100,
          max: 1000,
        },
        severity: "medium",
      }

      await request(app)
        .post("/api/bounties")
        .set("Authorization", `Bearer ${researcherToken}`)
        .send(bountyData)
        .expect(403)
    })
  })

  describe("GET /api/bounties", () => {
    beforeEach(async () => {
      const bounty = new Bounty({
        title: "Test Bounty",
        description: "Test description",
        company: companyUser._id,
        reward: { min: 100, max: 1000 },
        severity: "medium",
        status: "active",
      })
      await bounty.save()
    })

    it("should get all bounties without authentication", async () => {
      const response = await request(app).get("/api/bounties").expect(200)

      expect(response.body.bounties).toHaveLength(1)
      expect(response.body.bounties[0].title).toBe("Test Bounty")
    })
  })
})

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const Bounty = require("../models/Bounty")

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bugbounty")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Bounty.deleteMany({})
    console.log("Cleared existing data")

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: "admin@bugbounty.local",
      password: "Admin123!",
      role: "admin",
      profile: {
        firstName: "System",
        lastName: "Administrator",
      },
    })
    await adminUser.save()
    console.log("Created admin user")

    // Create company user
    const companyUser = new User({
      username: "techcorp",
      email: "security@techcorp.com",
      password: "Company123!",
      role: "company",
      profile: {
        company: "TechCorp Inc.",
        firstName: "Security",
        lastName: "Team",
      },
    })
    await companyUser.save()
    console.log("Created company user")

    // Create researcher user
    const researcherUser = new User({
      username: "researcher1",
      email: "researcher@example.com",
      password: "Researcher123!",
      role: "researcher",
      profile: {
        firstName: "John",
        lastName: "Hacker",
        bio: "Ethical hacker with 5 years of experience",
      },
      reputation: 150,
    })
    await researcherUser.save()
    console.log("Created researcher user")

    // Create sample bounties
    const sampleBounties = [
      {
        title: "Web Application Security Testing",
        description:
          "We are looking for security researchers to test our main web application for vulnerabilities including XSS, SQL injection, authentication bypasses, and other security issues.",
        company: companyUser._id,
        reward: {
          min: 100,
          max: 5000,
          currency: "USD",
        },
        severity: "high",
        scope: {
          domains: ["app.techcorp.com", "*.techcorp.com"],
          excludedDomains: ["blog.techcorp.com"],
          assets: ["Web Application", "API Endpoints"],
        },
        tags: ["web", "xss", "sql-injection", "authentication"],
        status: "active",
      },
      {
        title: "Mobile App Penetration Testing",
        description:
          "Security assessment of our iOS and Android mobile applications. Looking for vulnerabilities in data storage, network communication, and authentication mechanisms.",
        company: companyUser._id,
        reward: {
          min: 200,
          max: 3000,
          currency: "USD",
        },
        severity: "medium",
        scope: {
          assets: ["iOS App", "Android App", "Mobile API"],
        },
        tags: ["mobile", "ios", "android", "api"],
        status: "active",
      },
      {
        title: "Infrastructure Security Review",
        description:
          "Comprehensive security review of our cloud infrastructure and network security. Focus on misconfigurations, access controls, and network segmentation.",
        company: companyUser._id,
        reward: {
          min: 500,
          max: 10000,
          currency: "USD",
        },
        severity: "critical",
        scope: {
          domains: ["*.techcorp.com"],
          assets: ["Cloud Infrastructure", "Network Security", "Access Controls"],
        },
        tags: ["infrastructure", "cloud", "network", "aws"],
        status: "active",
      },
    ]

    await Bounty.insertMany(sampleBounties)
    console.log("Created sample bounties")

    console.log("\n=== Seed Data Created Successfully ===")
    console.log("Admin User: admin@bugbounty.local / Admin123!")
    console.log("Company User: security@techcorp.com / Company123!")
    console.log("Researcher User: researcher@example.com / Researcher123!")
    console.log("=====================================\n")

    process.exit(0)
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  }
}

seedData()

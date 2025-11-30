const { spawn, exec } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 Starting BugBountyX Development Environment...\n")

// Check if MongoDB is running
function checkMongoDB() {
  return new Promise((resolve) => {
    exec("mongod --version", (error) => {
      if (error) {
        console.log("❌ MongoDB is not installed or not in PATH")
        console.log("📥 Please install MongoDB from: https://www.mongodb.com/try/download/community")
        resolve(false)
      } else {
        console.log("✅ MongoDB is installed")
        resolve(true)
      }
    })
  })
}

// Check if MongoDB is running on port 27017
function checkMongoConnection() {
  return new Promise((resolve) => {
    const mongoose = require("mongoose")
    mongoose
      .connect("mongodb://localhost:27017/test", {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
      })
      .then(() => {
        console.log("✅ MongoDB is running")
        mongoose.connection.close()
        resolve(true)
      })
      .catch(() => {
        console.log("❌ MongoDB is not running")
        resolve(false)
      })
  })
}

// Start MongoDB if not running
function startMongoDB() {
  return new Promise((resolve) => {
    console.log("🔄 Starting MongoDB...")

    // Ensure data directory exists
    if (!fs.existsSync("./data/db")) {
      fs.mkdirSync("./data/db", { recursive: true })
      console.log("📁 Created data/db directory")
    }

    const mongoProcess = spawn("mongod", ["--dbpath", "./data/db", "--port", "27017"], {
      stdio: "pipe",
      detached: true,
    })

    mongoProcess.stdout.on("data", (data) => {
      const output = data.toString()
      if (output.includes("waiting for connections")) {
        console.log("✅ MongoDB started successfully")
        resolve(true)
      }
    })

    mongoProcess.stderr.on("data", (data) => {
      const error = data.toString()
      if (error.includes("Address already in use")) {
        console.log("✅ MongoDB is already running")
        resolve(true)
      } else if (!error.includes("warning")) {
        console.log("MongoDB error:", error)
      }
    })

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log("⏱️  MongoDB startup timeout - it might still be starting")
      resolve(true)
    }, 10000)
  })
}

async function main() {
  try {
    // Check if MongoDB is installed
    const mongoInstalled = await checkMongoDB()
    if (!mongoInstalled) {
      process.exit(1)
    }

    // Check if MongoDB is running
    const mongoRunning = await checkMongoConnection()
    if (!mongoRunning) {
      await startMongoDB()
      // Wait a bit for MongoDB to fully start
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }

    // Check if we need to seed the database
    const mongoose = require("mongoose")
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bugbounty")

    const User = require("../models/User")
    const userCount = await User.countDocuments()

    if (userCount === 0) {
      console.log("🌱 Database is empty, running seed script...")
      await mongoose.connection.close()

      // Run seed script
      const seedProcess = spawn("node", ["scripts/seed.js"], { stdio: "inherit" })
      await new Promise((resolve) => {
        seedProcess.on("close", resolve)
      })
    } else {
      console.log("✅ Database already has data")
      await mongoose.connection.close()
    }

    console.log("\n🎉 Everything is ready!")
    console.log("🔗 Backend will start at: http://localhost:3000")
    console.log("🔗 Frontend will start at: http://localhost:3001")
    console.log("\n📋 Test accounts:")
    console.log("👤 Admin: admin@bugbounty.local / Admin123!")
    console.log("🏢 Company: security@techcorp.com / Company123!")
    console.log("🔍 Researcher: researcher@example.com / Researcher123!")

    // Start the main application
    console.log("\n🚀 Starting the backend server...")
    const serverProcess = spawn("npm", ["run", "dev"], { stdio: "inherit" })

    process.on("SIGINT", () => {
      console.log("\n👋 Shutting down...")
      serverProcess.kill()
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Setup failed:", error.message)
    process.exit(1)
  }
}

main()

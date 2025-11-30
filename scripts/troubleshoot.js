const fs = require("fs")
const { exec } = require("child_process")
const mongoose = require("mongoose")

console.log("🔧 BugBountyX Troubleshooting Tool\n")

async function checkSystem() {
  console.log("1. 📋 Checking system requirements...")

  // Check Node.js version
  console.log(`   Node.js version: ${process.version}`)
  if (Number.parseInt(process.version.slice(1)) < 14) {
    console.log("   ⚠️  Warning: Node.js 14+ recommended")
  } else {
    console.log("   ✅ Node.js version is good")
  }

  // Check if MongoDB is installed
  return new Promise((resolve) => {
    exec("mongod --version", (error, stdout) => {
      if (error) {
        console.log("   ❌ MongoDB not found in PATH")
        console.log("   💡 Install from: https://www.mongodb.com/try/download/community")
      } else {
        console.log("   ✅ MongoDB is installed")
        console.log(`   📦 Version: ${stdout.split("\n")[0]}`)
      }
      resolve()
    })
  })
}

function checkDirectories() {
  console.log("\n2. 📁 Checking directories...")

  const requiredDirs = ["./data", "./data/db", "./uploads"]
  requiredDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`   ✅ ${dir} exists`)
    } else {
      console.log(`   ❌ ${dir} missing`)
      fs.mkdirSync(dir, { recursive: true })
      console.log(`   🔧 Created ${dir}`)
    }
  })
}

function checkFiles() {
  console.log("\n3. 📄 Checking configuration files...")

  if (fs.existsSync(".env")) {
    console.log("   ✅ .env file exists")
    const envContent = fs.readFileSync(".env", "utf8")
    if (envContent.includes("MONGODB_URI")) {
      console.log("   ✅ MONGODB_URI configured")
    } else {
      console.log("   ⚠️  MONGODB_URI not found in .env")
    }
  } else {
    console.log("   ❌ .env file missing")
    console.log("   💡 Run: npm run setup")
  }

  if (fs.existsSync("node_modules")) {
    console.log("   ✅ Dependencies installed")
  } else {
    console.log("   ❌ Dependencies not installed")
    console.log("   💡 Run: npm install")
  }
}

async function checkMongoDB() {
  console.log("\n4. 🗄️  Checking MongoDB connection...")

  try {
    await mongoose.connect("mongodb://localhost:27017/bugbounty", {
      serverSelectionTimeoutMS: 3000,
    })
    console.log("   ✅ MongoDB connection successful")

    const User = require("../models/User")
    const userCount = await User.countDocuments()
    console.log(`   📊 Users in database: ${userCount}`)

    if (userCount === 0) {
      console.log("   💡 Database is empty, run: npm run seed")
    }

    await mongoose.connection.close()
  } catch (error) {
    console.log("   ❌ MongoDB connection failed")
    console.log("   💡 Start MongoDB with: npm run mongo")
    console.log(`   🔍 Error: ${error.message}`)
  }
}

function checkPorts() {
  console.log("\n5. 🔌 Checking ports...")

  const net = require("net")

  const checkPort = (port, name) => {
    return new Promise((resolve) => {
      const server = net.createServer()
      server.listen(port, () => {
        server.close(() => {
          console.log(`   ✅ Port ${port} (${name}) is available`)
          resolve(true)
        })
      })
      server.on("error", () => {
        console.log(`   ⚠️  Port ${port} (${name}) is in use`)
        resolve(false)
      })
    })
  }

  return Promise.all([checkPort(3000, "Backend"), checkPort(3001, "Frontend"), checkPort(27017, "MongoDB")])
}

async function main() {
  try {
    await checkSystem()
    checkDirectories()
    checkFiles()
    await checkMongoDB()
    await checkPorts()

    console.log("\n🎉 Troubleshooting complete!")
    console.log("\n📋 Quick start commands:")
    console.log("   npm run setup     - Initial setup")
    console.log("   npm run mongo     - Start MongoDB")
    console.log("   npm run seed      - Seed database")
    console.log("   npm run dev       - Start backend")
    console.log("   cd client && npm start - Start frontend")
  } catch (error) {
    console.error("\n❌ Troubleshooting failed:", error.message)
  }

  process.exit(0)
}

main()

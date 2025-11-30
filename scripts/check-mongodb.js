const mongoose = require("mongoose")

console.log("🔍 Checking MongoDB connection...")

mongoose
  .connect("mongodb://localhost:27017/bugbounty", {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB is running and accessible")
    console.log("📊 Database: bugbounty")
    console.log("🔗 Connection: mongodb://localhost:27017/bugbounty")
    process.exit(0)
  })
  .catch((error) => {
    console.log("❌ MongoDB connection failed")
    console.log("💡 Make sure MongoDB is running with: npm run mongo")
    console.log("📋 Or run the setup first: npm run setup")
    console.log("Error details:", error.message)
    process.exit(1)
  })

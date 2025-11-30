const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up BugBountyX platform...\n")

// Create necessary directories
const directories = ["./data", "./data/db", "./uploads", "./logs"]

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  } else {
    console.log(`📁 Directory already exists: ${dir}`)
  }
})

// Create .env file if it doesn't exist
if (!fs.existsSync(".env")) {
  const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bugbounty

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Test Database (for running tests)
MONGODB_TEST_URI=mongodb://localhost:27017/bugbounty-test
`

  fs.writeFileSync(".env", envContent)
  console.log("✅ Created .env file with default configuration")
} else {
  console.log("📄 .env file already exists")
}

// Create a simple MongoDB start script for different platforms
const mongoStartScript =
  process.platform === "win32"
    ? `@echo off
echo Starting MongoDB...
if not exist "data\\db" mkdir data\\db
mongod --dbpath data\\db --port 27017
pause
`
    : `#!/bin/bash
echo "Starting MongoDB..."
mkdir -p data/db
mongod --dbpath ./data/db --port 27017
`

const scriptExtension = process.platform === "win32" ? ".bat" : ".sh"
const scriptName = `start-mongodb${scriptExtension}`

fs.writeFileSync(scriptName, mongoStartScript)
if (process.platform !== "win32") {
  fs.chmodSync(scriptName, "755")
}

console.log(`✅ Created MongoDB start script: ${scriptName}`)

console.log("\n🎉 Setup complete!")
console.log("\n📋 Next steps:")
console.log("1. Make sure MongoDB is installed on your system")
console.log(`2. Run: ${process.platform === "win32" ? scriptName : `./${scriptName}`} (in a separate terminal)`)
console.log("3. Run: npm run seed (to create initial data)")
console.log("4. Run: npm run dev (to start the backend)")
console.log("5. Run: cd client && npm start (to start the frontend)")
console.log("\n🔗 Access your app at: http://localhost:3001")

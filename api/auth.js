const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { validateRegistration, validateLogin } = require("../middleware/validation")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password, role, profile } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email or username",
      })
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      profile: profile || {},
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

// Login
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        reputation: user.reputation,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        profile: req.user.profile,
        reputation: req.user.reputation,
        createdAt: req.user.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { profile } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile } },
      { new: true, runValidators: true },
    ).select("-password")

    res.json({
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

module.exports = router

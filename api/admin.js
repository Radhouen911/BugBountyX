const express = require("express")
const Submission = require("../models/Submission")
const Bounty = require("../models/Bounty")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Get all submissions (admin only)
router.get("/submissions", auth, authorize("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, severity, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const query = {}
    if (status) query.status = status
    if (severity) query.severity = severity

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    }

    const submissions = await Submission.find(query)
      .populate("bounty", "title company")
      .populate("researcher", "username reputation")
      .populate("reviewedBy", "username")
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)

    const total = await Submission.countDocuments(query)

    res.json({
      submissions,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total,
      },
    })
  } catch (error) {
    console.error("Admin submissions fetch error:", error)
    res.status(500).json({ error: "Failed to fetch submissions" })
  }
})

// Update submission status (admin only)
router.put("/submissions/:id", auth, authorize("admin"), async (req, res) => {
  try {
    const { status, adminNotes, reward } = req.body

    const submission = await Submission.findById(req.params.id)
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    // Update submission
    const updateData = {
      status,
      adminNotes,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    }

    if (reward) {
      updateData.reward = reward
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "bounty", select: "title company" },
      { path: "researcher", select: "username reputation" },
      { path: "reviewedBy", select: "username" },
    ])

    // Update bounty valid submission count if accepted
    if (status === "accepted" && submission.status !== "accepted") {
      await Bounty.findByIdAndUpdate(submission.bounty, {
        $inc: { validSubmissionCount: 1 },
      })

      // Update researcher reputation
      await User.findByIdAndUpdate(submission.researcher, {
        $inc: { reputation: 10 },
      })
    }

    res.json({
      message: "Submission updated successfully",
      submission: updatedSubmission,
    })
  } catch (error) {
    console.error("Submission update error:", error)
    res.status(500).json({ error: "Failed to update submission" })
  }
})

// Get dashboard statistics (admin only)
router.get("/dashboard", auth, authorize("admin"), async (req, res) => {
  try {
    const [
      totalBounties,
      activeBounties,
      totalSubmissions,
      pendingSubmissions,
      totalUsers,
      totalCompanies,
      totalResearchers,
    ] = await Promise.all([
      Bounty.countDocuments(),
      Bounty.countDocuments({ status: "active" }),
      Submission.countDocuments(),
      Submission.countDocuments({ status: "pending" }),
      User.countDocuments(),
      User.countDocuments({ role: "company" }),
      User.countDocuments({ role: "researcher" }),
    ])

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .populate("bounty", "title")
      .populate("researcher", "username")
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      statistics: {
        totalBounties,
        activeBounties,
        totalSubmissions,
        pendingSubmissions,
        totalUsers,
        totalCompanies,
        totalResearchers,
      },
      recentSubmissions,
    })
  } catch (error) {
    console.error("Dashboard fetch error:", error)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

// Get all users (admin only)
router.get("/users", auth, authorize("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const query = {}
    if (role) query.role = role

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    }

    const users = await User.find(query)
      .select("-password")
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)

    const total = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total,
      },
    })
  } catch (error) {
    console.error("Users fetch error:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Toggle user active status (admin only)
router.put("/users/:id/toggle-status", auth, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    user.isActive = !user.isActive
    await user.save()

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error("User status toggle error:", error)
    res.status(500).json({ error: "Failed to toggle user status" })
  }
})

module.exports = router

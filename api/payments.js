const express = require("express")
const Submission = require("../models/Submission")
const User = require("../models/User")
const { auth, authorize } = require("../middleware/auth")

const router = express.Router()

// Mock payment processing
router.post("/", auth, authorize("admin"), async (req, res) => {
  try {
    const { submissionId, amount, currency = "USD" } = req.body

    if (!submissionId || !amount || amount <= 0) {
      return res.status(400).json({
        error: "Submission ID and valid amount are required",
      })
    }

    // Find the submission
    const submission = await Submission.findById(submissionId)
      .populate("researcher", "username email")
      .populate("bounty", "title")

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    if (submission.status !== "accepted") {
      return res.status(400).json({
        error: "Only accepted submissions can be paid",
      })
    }

    if (submission.reward.paid) {
      return res.status(400).json({
        error: "This submission has already been paid",
      })
    }

    // Mock payment processing (in real app, integrate with payment gateway)
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update submission with payment info
    submission.reward = {
      amount,
      currency,
      paid: true,
      paidAt: new Date(),
    }
    await submission.save()

    // Log payment details (in real app, store in payment records)
    const paymentLog = {
      paymentId,
      submissionId: submission._id,
      researcherId: submission.researcher._id,
      researcherEmail: submission.researcher.email,
      amount,
      currency,
      bountyTitle: submission.bounty.title,
      processedAt: new Date(),
      status: "completed",
    }

    console.log("Payment processed:", JSON.stringify(paymentLog, null, 2))

    res.json({
      message: "Payment processed successfully",
      payment: {
        id: paymentId,
        amount,
        currency,
        researcher: submission.researcher.username,
        bounty: submission.bounty.title,
        processedAt: paymentLog.processedAt,
      },
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    res.status(500).json({ error: "Payment processing failed" })
  }
})

// Get payment history (admin only)
router.get("/history", auth, authorize("admin"), async (req, res) => {
  try {
    const paidSubmissions = await Submission.find({ "reward.paid": true })
      .populate("researcher", "username email")
      .populate("bounty", "title")
      .sort({ "reward.paidAt": -1 })

    const payments = paidSubmissions.map((submission) => ({
      id: submission._id,
      amount: submission.reward.amount,
      currency: submission.reward.currency,
      researcher: {
        id: submission.researcher._id,
        username: submission.researcher.username,
        email: submission.researcher.email,
      },
      bounty: {
        id: submission.bounty._id,
        title: submission.bounty.title,
      },
      paidAt: submission.reward.paidAt,
    }))

    res.json({ payments })
  } catch (error) {
    console.error("Payment history fetch error:", error)
    res.status(500).json({ error: "Failed to fetch payment history" })
  }
})

// Get researcher earnings (researcher only)
router.get("/earnings", auth, authorize("researcher"), async (req, res) => {
  try {
    const paidSubmissions = await Submission.find({
      researcher: req.user._id,
      "reward.paid": true,
    }).populate("bounty", "title")

    const totalEarnings = paidSubmissions.reduce((sum, submission) => {
      return sum + (submission.reward.amount || 0)
    }, 0)

    const earnings = paidSubmissions.map((submission) => ({
      submissionId: submission._id,
      bountyTitle: submission.bounty.title,
      amount: submission.reward.amount,
      currency: submission.reward.currency,
      paidAt: submission.reward.paidAt,
    }))

    res.json({
      totalEarnings,
      currency: "USD",
      payments: earnings,
    })
  } catch (error) {
    console.error("Earnings fetch error:", error)
    res.status(500).json({ error: "Failed to fetch earnings" })
  }
})

module.exports = router

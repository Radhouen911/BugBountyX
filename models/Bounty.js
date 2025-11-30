const mongoose = require("mongoose")

const bountySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reward: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    scope: {
      domains: [String],
      excludedDomains: [String],
      assets: [String],
    },
    status: {
      type: String,
      enum: ["active", "paused", "closed"],
      default: "active",
    },
    tags: [String],
    submissionCount: {
      type: Number,
      default: 0,
    },
    validSubmissionCount: {
      type: Number,
      default: 0,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
bountySchema.index({ title: "text", description: "text", tags: "text" })
bountySchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model("Bounty", bountySchema)

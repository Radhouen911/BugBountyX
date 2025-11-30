const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema(
  {
    bounty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
    },
    researcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    steps: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    impact: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "triaging", "accepted", "rejected", "duplicate", "resolved"],
      default: "pending",
    },
    adminNotes: String,
    reward: {
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
      paid: {
        type: Boolean,
        default: false,
      },
      paidAt: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Prevent duplicate submissions for same bounty by same researcher
submissionSchema.index({ bounty: 1, researcher: 1 }, { unique: true })
submissionSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model("Submission", submissionSchema)

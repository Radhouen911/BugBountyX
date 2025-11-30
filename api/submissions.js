const express = require("express");
const Submission = require("../models/Submission");
const Bounty = require("../models/Bounty");
const { auth, authorize } = require("../middleware/auth");
const { validateSubmission } = require("../middleware/validation");
const upload = require("../middleware/upload");

const router = express.Router();

// Submit vulnerability (researchers only)
router.post(
  "/",
  auth,
  authorize("researcher"),
  upload.array("attachments", 5),
  validateSubmission,
  async (req, res) => {
    try {
      const { bountyId, title, description, severity, steps, impact } =
        req.body;

      // Check if bounty exists and is active
      const bounty = await Bounty.findById(bountyId);
      if (!bounty) {
        return res.status(404).json({ error: "Bounty not found" });
      }

      if (bounty.status !== "active") {
        return res.status(400).json({ error: "Bounty is not active" });
      }

      // Check for duplicate submission (handled by unique index, but provide better error message)
      const existingSubmission = await Submission.findOne({
        bounty: bountyId,
        researcher: req.user._id,
      });

      if (existingSubmission) {
        return res.status(400).json({
          error: "You have already submitted a vulnerability for this bounty",
        });
      }

      // Process file attachments
      const attachments = req.files
        ? req.files.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
          }))
        : [];

      // Create submission
      const submission = new Submission({
        bounty: bountyId,
        researcher: req.user._id,
        title,
        description,
        severity,
        steps,
        impact,
        attachments,
      });

      await submission.save();

      // Update bounty submission count
      await Bounty.findByIdAndUpdate(bountyId, {
        $inc: { submissionCount: 1 },
      });

      await submission.populate([
        { path: "bounty", select: "title company" },
        { path: "researcher", select: "username" },
      ]);

      res.status(201).json({
        message: "Vulnerability submitted successfully",
        submission,
      });
    } catch (error) {
      console.error("Submission error:", error);
      res.status(500).json({ error: "Failed to submit vulnerability" });
    }
  }
);

// Get submission by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("bounty", "title company")
      .populate("researcher", "username reputation")
      .populate("reviewedBy", "username");

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check access permissions
    const isOwner =
      submission.researcher._id.toString() === req.user._id.toString();
    const isCompanyOwner =
      submission.bounty.company.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isCompanyOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ submission });
  } catch (error) {
    console.error("Submission fetch error:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

// Get researcher's submissions
router.get(
  "/researcher/mine",
  auth,
  authorize("researcher"),
  async (req, res) => {
    try {
      const submissions = await Submission.find({ researcher: req.user._id })
        .populate("bounty", "title company")
        .sort({ createdAt: -1 });

      res.json({ submissions });
    } catch (error) {
      console.error("Researcher submissions fetch error:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }
);

// Get company's received submissions
router.get(
  "/company/received",
  auth,
  authorize("company"),
  async (req, res) => {
    try {
      // Find bounties owned by the company
      const bounties = await Bounty.find({ company: req.user._id }).select(
        "_id"
      );
      const bountyIds = bounties.map((b) => b._id);

      const submissions = await Submission.find({ bounty: { $in: bountyIds } })
        .populate("bounty", "title")
        .populate("researcher", "username reputation")
        .sort({ createdAt: -1 });

      res.json({ submissions });
    } catch (error) {
      console.error("Company submissions fetch error:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }
);

module.exports = router;

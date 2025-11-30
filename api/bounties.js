const express = require("express");
const Bounty = require("../models/Bounty");
const { auth, authorize } = require("../middleware/auth");
const { validateBounty } = require("../middleware/validation");

const router = express.Router();

// Get all bounties (public)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "active",
      severity,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { status };

    if (severity) {
      query.severity = severity;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
      populate: {
        path: "company",
        select: "username profile.company",
      },
    };

    const bounties = await Bounty.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Bounty.countDocuments(query);

    res.json({
      bounties,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total,
      },
    });
  } catch (error) {
    console.error("Bounties fetch error:", error);
    res.status(500).json({ error: "Failed to fetch bounties" });
  }
});

// Get bounties by company (company owner only) - MUST be before /:id route
router.get("/company/mine", auth, authorize("company"), async (req, res) => {
  try {
    const bounties = await Bounty.find({ company: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ bounties });
  } catch (error) {
    console.error("Company bounties fetch error:", error);
    res.status(500).json({ error: "Failed to fetch company bounties" });
  }
});

// Get single bounty
router.get("/:id", async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id).populate(
      "company",
      "username profile.company"
    );

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    res.json({ bounty });
  } catch (error) {
    console.error("Bounty fetch error:", error);
    res.status(500).json({ error: "Failed to fetch bounty" });
  }
});

// Create bounty (companies only)
router.post(
  "/",
  auth,
  authorize("company"),
  validateBounty,
  async (req, res) => {
    try {
      const bountyData = {
        ...req.body,
        company: req.user._id,
      };

      // Validate reward range
      if (bountyData.reward.min > bountyData.reward.max) {
        return res.status(400).json({
          error: "Minimum reward cannot be greater than maximum reward",
        });
      }

      const bounty = new Bounty(bountyData);
      await bounty.save();

      await bounty.populate("company", "username profile.company");

      res.status(201).json({
        message: "Bounty created successfully",
        bounty,
      });
    } catch (error) {
      console.error("Bounty creation error:", error);
      res.status(500).json({ error: "Failed to create bounty" });
    }
  }
);

// Update bounty (company owner only)
router.put(
  "/:id",
  auth,
  authorize("company"),
  validateBounty,
  async (req, res) => {
    try {
      const bounty = await Bounty.findById(req.params.id);

      if (!bounty) {
        return res.status(404).json({ error: "Bounty not found" });
      }

      // Check if user owns this bounty
      if (bounty.company.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          error: "Access denied. You can only update your own bounties.",
        });
      }

      // Validate reward range
      if (req.body.reward && req.body.reward.min > req.body.reward.max) {
        return res.status(400).json({
          error: "Minimum reward cannot be greater than maximum reward",
        });
      }

      const updatedBounty = await Bounty.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate("company", "username profile.company");

      res.json({
        message: "Bounty updated successfully",
        bounty: updatedBounty,
      });
    } catch (error) {
      console.error("Bounty update error:", error);
      res.status(500).json({ error: "Failed to update bounty" });
    }
  }
);

// Delete bounty (company owner only)
router.delete("/:id", auth, authorize("company"), async (req, res) => {
  try {
    const bounty = await Bounty.findById(req.params.id);

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    // Check if user owns this bounty
    if (bounty.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own bounties.",
      });
    }

    await Bounty.findByIdAndDelete(req.params.id);

    res.json({ message: "Bounty deleted successfully" });
  } catch (error) {
    console.error("Bounty deletion error:", error);
    res.status(500).json({ error: "Failed to delete bounty" });
  }
});

module.exports = router;

const { body, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

const validateRegistration = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must be 3-30 characters and contain only letters, numbers, and underscores"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must be at least 6 characters with uppercase, lowercase, and number"),
  body("role").isIn(["company", "researcher"]).withMessage("Role must be either company or researcher"),
  handleValidationErrors,
]

const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

const validateBounty = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be 5-200 characters"),
  body("description").trim().isLength({ min: 20, max: 5000 }).withMessage("Description must be 20-5000 characters"),
  body("reward.min").isNumeric().isFloat({ min: 0 }).withMessage("Minimum reward must be a positive number"),
  body("reward.max").isNumeric().isFloat({ min: 0 }).withMessage("Maximum reward must be a positive number"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Severity must be low, medium, high, or critical"),
  handleValidationErrors,
]

const validateSubmission = [
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be 5-200 characters"),
  body("description").trim().isLength({ min: 20, max: 10000 }).withMessage("Description must be 20-10000 characters"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Severity must be low, medium, high, or critical"),
  body("steps").trim().isLength({ min: 10, max: 5000 }).withMessage("Steps must be 10-5000 characters"),
  body("impact").trim().isLength({ min: 10, max: 2000 }).withMessage("Impact must be 10-2000 characters"),
  handleValidationErrors,
]

module.exports = {
  validateRegistration,
  validateLogin,
  validateBounty,
  validateSubmission,
  handleValidationErrors,
}

const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller.js");
const authenticate = require("../middleware/auth.js");

// POST /api/feedback - Submit feedback
router.post("/", authenticate, feedbackController.submitFeedback);

module.exports = router;

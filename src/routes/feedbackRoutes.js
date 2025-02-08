const express = require("express");
const {
  submitFeedback,
  getCourseFeedback,
} = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:courseId", protect, submitFeedback); // Submit feedback
router.get("/:courseId", protect, getCourseFeedback); // Get course feedback

module.exports = router;

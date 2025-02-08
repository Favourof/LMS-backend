const express = require("express");
const {
  enrollInCourse,
  markModuleAsCompleted,
  getCourseProgress,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/enroll/:courseId", protect, enrollInCourse);
router.put("/complete/:courseId", protect, markModuleAsCompleted);
router.get("/:courseId", protect, getCourseProgress);

module.exports = router;

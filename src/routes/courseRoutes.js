const express = require("express");
const {
  createCourse,
  getCourses,
  getCourse,
  deleteCourse,
  updateCourseDetails,
  addModulesToCourse,
  updateSpecificModule,
  getAdminCourses,
} = require("../controllers/courseController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getCourses); // Get all
router.get("/admin", protect, getAdminCourses);
router.get("/:id", getCourse); // Get a single course
router.put("/:id", protect, restrictTo("admin"), updateCourseDetails);
router.put(
  "/:id/modules",
  protect,
  restrictTo("admin"),
  upload.array("file", 10),
  addModulesToCourse
);
router.put(
  "/:id/module",
  protect,
  restrictTo("admin"),
  upload.single("file"),
  updateSpecificModule
);

// Protected routes (Admin Only)
router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "modulefile", maxCount: 10 },
  ]),
  createCourse
);
router.delete("/:id", protect, restrictTo("admin"), deleteCourse);

module.exports = router;

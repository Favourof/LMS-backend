const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUser,
  checkUserRole,
} = require("../controllers/authController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", protect, restrictTo("admin"), getAllUser);
router.get("/check-user-role", protect, checkUserRole);

module.exports = router;

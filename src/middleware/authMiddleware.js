const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncWrapper = require("../utils/asyncWrapper");
const AppError = require("../utils/appError");

// Protect routes by verifying token
exports.protect = asyncWrapper(async (req, res, next) => {
  let token;

  // Check if token is sent in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token
  }

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  req.user = user;
  next();
});

// Restrict routes to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Not authorized to access this resource", 403));
    }
    next();
  };
};

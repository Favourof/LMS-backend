const asyncWrapper = require("../utils/asyncWrapper");
const AppError = require("../utils/appError");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
exports.registerUser = asyncWrapper(async (req, res, next) => {
  const { firstname, lastname, email, password, role } = req.body;

  if (!email || !password || !firstname || !lastname) {
    return next(new AppError("Enter all required details", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists", 400));
  }

  const user = new User({ firstname, lastname, email, password, role });
  await user.save();

  res.status(201).json({
    message: "User registered successfully",
    token: generateToken(user),
  });
});

// Login User
exports.loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Enter your details", 400));
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  res
    .status(200)
    .json({ message: "Login successful", token: generateToken(user), user });
});

// Get All Users (Admin Only)
exports.getAllUser = asyncWrapper(async (req, res, next) => {
  const users = await User.find({}, "name email role createdAt"); // Select only needed fields
  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

exports.checkUserRole = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let dashboardRoute = "/dashboard"; // Default route

  switch (user.role) {
    case "admin":
      dashboardRoute = "/admin-dashboard";
      break;
    case "student":
      dashboardRoute = "/dashboard";
      break;
    default:
      return next(new AppError("Invalid role", 400));
  }

  res.status(200).json({
    status: "success",
    role: user.role,
    redirectTo: dashboardRoute,
  });x
});

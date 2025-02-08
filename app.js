const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const AppError = require("./src/utils/appError");
const globalErrorHandler = require("./src/controllers/errorController");
const userRoute = require("./src/routes/authRoutes");
const courseRoute = require("./src/routes/courseRoutes");
const progressRoute = require("./src/routes/progressRoutes");
const feedbackRoute = require("./src/routes/feedbackRoutes");
// Initialize app
const app = express();

// Allow requests from your frontend domain
const corsOptions = {
  origin: 'https://lms-frontend-vert-omega.vercel.app', // Replace with your frontend domain
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware
app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));



// routes
// Routes
app.use("/api/auth", userRoute);
app.use("/api/courses", courseRoute);
app.use("/api/progress", progressRoute);
app.use("/api/feedback", feedbackRoute);

// Example route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this sever`, 404));
  console.log("error");
});

app.use(globalErrorHandler);
module.exports = app;

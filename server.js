require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...", err);
  process.exit(1);
});

// MongoDB Connection URI
const MONGO_URI = process.env.mongoURL || "mongodb://localhost:27017/lms";

let gfs; // Declare GridFS globally

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Start Express Server
const PORT = process.env.PORT || 4005;
const server = app.listen(PORT, () =>
  console.log(
    `🚀 Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } stage`
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...", err);
  server.close(() => {
    process.exit(1);
  });
});

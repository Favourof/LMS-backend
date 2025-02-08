const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    thumbnail: {
      type: String,
      required: true, // Ensure every course has a thumbnail
    },
    modules: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        contentType: {
          type: String,
          enum: ["text", "image", "video", "audio", "pdf"],
          required: [true, "A module must have a content type"],
        },
        contentUrl: {
          type: String,
        }, // Firebase Storage URL
      },
    ],
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    feedback: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Course", CourseSchema);

const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedModules: [
      {
        index: { type: Number, required: true }, // Module index
        title: { type: String, required: true }, // Module title
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", ProgressSchema);

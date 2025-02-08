const asyncWrapper = require("../utils/asyncWrapper");
const AppError = require("../utils/appError");
const Course = require("../models/Course");
const Progress = require("../models/Progress");

// 🟢 Submit Feedback (User)
exports.submitFeedback = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  if (!rating || !comment) {
    return next(new AppError("Rating and comment are required", 400));
  }

  // Check if the course exists
  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  // Check if user is enrolled in the course
  let progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress)
    return next(
      new AppError("You must be enrolled in this course to leave feedback", 403)
    );

  // Prevent multiple reviews from the same user
  const existingFeedback = course.feedback.find(
    (f) => f.user.toString() === userId.toString()
  );
  if (existingFeedback)
    return next(
      new AppError("You have already submitted feedback for this course", 400)
    );

  // Add feedback
  course.feedback.push({ user: userId, rating, comment });

  // Calculate new average rating
  const totalRatings = course.feedback.reduce(
    (sum, feedback) => sum + feedback.rating,
    0
  );
  course.averageRating = totalRatings / course.feedback.length;

  await course.save();

  res.status(201).json({
    status: "success",
    message: "Feedback submitted successfully",
    course,
  });
});

// 🟢 Get All Feedback for a Course (Admin)
exports.getCourseFeedback = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId).populate(
    "feedback.user",
    "name email"
  );

  if (!course) return next(new AppError("Course not found", 404));

  res.status(200).json({
    status: "success",
    feedback: course.feedback,
    averageRating: course.averageRating.toFixed(2),
  });
});

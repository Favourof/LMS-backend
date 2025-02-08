const asyncWrapper = require("../utils/asyncWrapper");
const AppError = require("../utils/appError");
const Progress = require("../models/Progress");
const Course = require("../models/Course");

// 🟢 Enroll in a Course (Now Updates `studentsEnrolled` in Course Model)
exports.enrollInCourse = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Check if the course exists
  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  // Check if user is already enrolled
  let progress = await Progress.findOne({ user: userId, course: courseId });
  if (progress) return next(new AppError("User is already enrolled", 400));

  // Create a new progress entry
  progress = await Progress.create({
    user: userId,
    course: courseId,
    completedModules: [],
  });

  // Add user to `studentsEnrolled` (if not already enrolled)
  if (!course.studentsEnrolled.includes(userId)) {
    course.studentsEnrolled.push(userId);
    await course.save();
  }

  res.status(201).json({
    status: "success",
    message: "Enrolled in course successfully",
    progress,
    studentsEnrolled: course.studentsEnrolled.length, // Show total enrolled students
  });
});

// 🟢 Mark a Module as Completed (With Validation)
exports.markModuleAsCompleted = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const { moduleIndex } = req.body;
  console.log(req.boby);
  
  const userId = req.user._id;

  if (moduleIndex === undefined) {
    return next(new AppError("Module index is required", 400));
  }

  // Find the course and check if the module exists
  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  const index = parseInt(moduleIndex);
  if (isNaN(index) || index < 0 || index >= course.modules.length) {
    return next(new AppError("Invalid module index", 400));
  }

  // Get module title
  const moduleTitle = course.modules[index].title;

  // Find user progress
  let progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress)
    return next(new AppError("User is not enrolled in this course", 404));

  // Check if module is already marked as completed
  const moduleExists = progress.completedModules.find((m) => m.index === index);
  if (moduleExists) {
    return next(new AppError("Module is already marked as completed", 400));
  }

  // Add module completion (index & title)
  progress.completedModules.push({ index, title: moduleTitle });
  await progress.save();

  res.status(200).json({
    status: "success",
    message: "Module marked as completed",
    progress,
  });
});

// 🟢 Get Course Progress (User)
exports.getCourseProgress = asyncWrapper(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Find the course
  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  // Get user progress
  let progress = await Progress.findOne({ user: userId, course: courseId });
  if (!progress)
    return next(new AppError("User is not enrolled in this course", 404));

  const totalModules = course.modules.length;
  const completedModules = progress.completedModules.length;
  const completionPercentage =
    totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  res.status(200).json({
    status: "success",
    progress: {
      totalModules,
      completedModules,
      completionPercentage: Math.round(completionPercentage * 100) / 100, // Round to 2 decimal places
      completedModuleDetails: progress.completedModules,
    },
  });
});

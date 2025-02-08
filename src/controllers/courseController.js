const asyncWrapper = require("../utils/asyncWrapper");
const AppError = require("../utils/appError");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const bucket = require("../config/firebase");

const { uploadToFirebase } = require("../middleware/uploadMiddleware");

exports.createCourse = asyncWrapper(async (req, res, next) => {
  try {
    // 🔒 Ensure Only Admins Can Create Courses
    if (req.user.role !== "admin") {
      return next(new AppError("Only admins can create courses", 403));
    }

    const { title, description, category, price, duration, modules } = req.body;

    // ✅ Parse Modules JSON Data Safely
    let parsedModules = [];
    if (modules) {
      try {
        parsedModules = JSON.parse(modules);
        if (!Array.isArray(parsedModules)) {
          return next(new AppError("Modules must be an array", 400));
        }
      } catch (error) {
        return next(
          new AppError("Invalid modules format. Expecting JSON array.", 400)
        );
      }
    }

    // ✅ Handle Thumbnail Upload
    let thumbnailUrl = "";
    if (req.files?.thumbnail?.length > 0) {
      thumbnailUrl = await uploadToFirebase(req.files.thumbnail[0]);
    }

    // ✅ Handle Module File Uploads (Wait for all uploads)
    if (req.files?.modulefile?.length > 0) {
      const uploadedModules = await Promise.all(
        req.files.modulefile.map(async (file, index) => {
          let contentType = "";
          if (file.mimetype.startsWith("image/")) contentType = "image";
          else if (file.mimetype.startsWith("video/")) contentType = "video";
          else if (file.mimetype.startsWith("audio/")) contentType = "audio";
          else if (file.mimetype === "application/pdf") contentType = "text";

          const contentUrl = await uploadToFirebase(file);

          return {
            title: parsedModules[index]?.title || `Module ${index + 1}`,
            contentType,
            contentUrl,
          };
        })
      );

      parsedModules = uploadedModules; // ✅ Ensure Modules are Updated
    }

    // ✅ Ensure All Modules Have `contentType`
    parsedModules = parsedModules.map((mod, index) => ({
      title: mod.title || `Module ${index + 1}`,
      contentType: mod.contentType || "text",
      contentUrl: mod.contentUrl || "",
    }));

    // ✅ Do NOT return response until everything is uploaded
    const course = await Course.create({
      title,
      description,
      category,
      price,
      duration,
      modules: parsedModules,
      thumbnail: thumbnailUrl,
      instructor: req.user._id,
    });

    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("🔥 Error in createCourse:", error);
    return next(new AppError("Internal server error", 500));
  }
});

// Get All Courses
exports.getCourses = asyncWrapper(async (req, res, next) => {
  //   console.log("get all course");

  const courses = await Course.find()
    .select("title description category price duration thumbnail averageRating")
    .populate("instructor", "firstname lastname")
    .lean();

  res.status(200).json({
    status: "success",
    results: courses.length,
    courses,
  });
});

// Get Courses Created by the Logged-in Admin
exports.getAdminCourses = asyncWrapper(async (req, res, next) => {
  // Check if the user is an admin
  if (req.user.role !== "admin") {
    return next(new AppError("Only admins can access their courses", 403));
  }

  // Find courses where the instructor matches the logged-in admin's ID
  const courses = await Course.find({ instructor: req.user._id })
    .select(
      "title description category price duration thumbnail averageRating "
    )
    .populate("instructor", "firstname");

  res.status(200).json({
    status: "success",
    results: courses.length,
    courses,
  });
});

// Get Single Course
exports.getCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "email name firstname lastname studentsEnrolled")
    .populate({
      path: "studentsEnrolled",
      select: "email name firstname lastname", // Select the fields you want to include
    })
    .populate({
      path: "feedback", // Assuming feedback is a field in the course schema
      select: "comment rating user", // Select the fields you want to include in feedback
      populate: {
        path: "user", // Assuming user is a field in the feedback schema
        select: "name firstname lastname", // Select the fields you want to include in user
      },
    })
    .lean();
  if (!course) return next(new AppError("Course not found", 404));
  res.status(200).json({ status: "success", course });
});

// 🟢 Update Course (Without Changing Modules)
exports.updateCourseDetails = asyncWrapper(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Only admins can update courses", 403));
  }

  const { title, description, category, price, duration } = req.body;
  const courseId = req.params.id;

  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  course = await Course.findByIdAndUpdate(
    courseId,
    { title, description, category, price, duration }, // Update course details only
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Course details updated successfully",
    course,
  });
});

exports.addModulesToCourse = asyncWrapper(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Only admins can update courses", 403));
  }

  const { modules } = req.body;
  const courseId = req.params.id;

  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  let parsedModules = JSON.parse(modules || "[]");

  // Process file uploads
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      const uploadedUrl = await uploadToFirebase(req.files[i]); // Upload to Firebase
      parsedModules[i].contentType = req.files[i].mimetype.startsWith("image/")
        ? "image"
        : req.files[i].mimetype.startsWith("video/")
        ? "video"
        : "audio";
      parsedModules[i].contentUrl = uploadedUrl;
    }
  }

  // Ensure `contentUrl` exists for every module
  parsedModules = parsedModules.map((module) => ({
    ...module,
    contentUrl: module.contentUrl || "",
  }));

  // Append new modules to existing modules
  course.modules = [...course.modules, ...parsedModules];
  await course.save();

  res.status(200).json({
    status: "success",
    message: "New modules added successfully",
    course,
  });
});

// / 🟢 Update a Specific Module in a Course
// 🟢 Update a Specific Module in a Course
exports.updateSpecificModule = asyncWrapper(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Only admins can update courses", 403));
  }

  const { moduleIndex, title } = req.body; // Identify module by index
  const courseId = req.params.id;

  let course = await Course.findById(courseId);
  if (!course) {
    console.log("Course not found");
    return next(new AppError("Course not found", 404));
  }

  // Ensure moduleIndex is valid
  const index = parseInt(moduleIndex);
  if (isNaN(index) || index < 0 || index >= course.modules.length) {
    console.log("Invalid module index");
    return next(new AppError("Invalid module index", 400));
  }

  // Update module title if provided
  if (title) {
    course.modules[index].title = title;
  }

  // If a new file is uploaded, update contentType & contentUrl with Firebase URL
  if (req.file) {
    try {
      const uploadedUrl = await uploadToFirebase(req.file); // Upload to Firebase

      let contentType = "text";
      if (req.file.mimetype.startsWith("image/")) contentType = "image";
      else if (req.file.mimetype.startsWith("video/")) contentType = "video";
      else if (req.file.mimetype.startsWith("audio/")) contentType = "audio";
      else if (req.file.mimetype === "application/pdf")
        contentType = "document"; // PDF Support

      course.modules[index].contentType = contentType;
      course.modules[index].contentUrl = uploadedUrl; // Store Firebase URL
    } catch (error) {
      console.error("File upload failed:", error);
      return next(new AppError("File upload failed. Try again.", 500));
    }
  }

  await course.save();
  console.log("Module updated successfully");

  res.status(200).json({
    status: "success",
    message: "Module updated successfully",
    course,
  });
});

// Function to delete a file from Firebase Storage
const deleteFromFirebase = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    const filePath = fileUrl.split("/o/")[1].split("?alt=media")[0]; // Extract Firebase file path
    const decodedFilePath = decodeURIComponent(filePath); // Decode URL encoding

    await bucket.file(decodedFilePath).delete();
    console.log(`✅ File deleted from Firebase: ${decodedFilePath}`);
  } catch (error) {
    console.error("⚠️ Error deleting file from Firebase:", error.message);
  }
};

// 🟢 Delete Course (Admin Only)
exports.deleteCourse = asyncWrapper(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Only admins can delete courses", 403));
  }

  const courseId = req.params.id;
  let course = await Course.findById(courseId);
  if (!course) return next(new AppError("Course not found", 404));

  // Delete all associated files from Firebase Storage
  for (let module of course.modules) {
    if (module.contentUrl) {
      await deleteFromFirebase(module.contentUrl);
    }
  }

  // Delete course from database
  await Course.findByIdAndDelete(courseId);

  res.status(200).json({
    status: "success",
    message: "Course and associated files deleted successfully",
  });
});

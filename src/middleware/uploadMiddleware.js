const multer = require("multer");
const bucket = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");

// Multer Configuration (Stores files in memory before uploading)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Function to Upload File to Firebase (Authenticated)
const uploadToFirebase = async (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `LMS_Courses/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        firebaseStorageDownloadTokens: uuidv4(), // Generates a download token
      },
    });

    blobStream.on("error", (error) => reject(error));

    blobStream.on("finish", async () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(fileName)}?alt=media`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

// Export the upload functions
module.exports = { upload, uploadToFirebase };

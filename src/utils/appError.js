// Define a custom error class that extends the built-in Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent class constructor with the error message

    this.statusCode = statusCode; // Set the status code for the error
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // Determine the status based on the status code
    this.isOperational = true; // Mark the error as operational (trusted)

    Error.captureStackTrace(this, this.constructor); // Capture the stack trace
  }
}

module.exports = AppError; // Export the custom error class

const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleTimeoutError = (err) => {
  const message = `Request took too long! Please try again.`;
  return new AppError(message, 408);
};

const handleECONNRESETError = (err) => {
  const message = "Connection was reset. Please try again later.";
  return new AppError(message, 502); // 502 Bad Gateway
};

const handleJwtError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleTokenExpiredError = () =>
  new AppError("Token expired. Please log in again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      // error: err,
    });
    // console.log(err);

    // Programming or the other unknow eror: leak error details
  } else {
    // log error
    console.error("Error 🐦‍🔥🐦‍🔥", err);
    // 2) send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack, "🐦‍🔥🐦‍🔥🐦‍🔥");

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJwtError();
    if (err.name === "TokenExpiredError") error = handleTokenExpiredError();
    if (err.name === "TimeoutError") error = handleTimeoutError(error);
    if (err.code === "ECONNRESET") error = handleECONNRESETError(error);

    sendErrorPro(error, res);
  }
};

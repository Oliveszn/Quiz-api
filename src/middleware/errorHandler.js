const {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors");

const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code set
  //   let error = { ...err };
  //   err.message = err.message;
  //   statusCode = err.statusCode || 500;
  //   err.status = err.status || "error";
  //   const error = {
  //     message: err.message || "Internal Server Error",
  //     statusCode: err.statusCode || 500,
  //     status: err.status || "error",
  //     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  //   };
  if (!err) {
    err = new Error("Unknown error occurred");
    err.statusCode = 500;
  }

  // Create a working copy of the error
  let error = err;

  // Log the error for debugging (consider using a logger like Winston)
  //   console.error("ERROR 💥:", {
  //     timestamp: new Date().toISOString(),
  //     method: req.method,
  //     url: req.originalUrl,
  //     ip: req.ip,
  //     userAgent: req.get("User-Agent"),
  //     error: {
  //       name: err.name,
  //       message: err.message,
  //       stack: err.stack,
  //       statusCode: err.statusCode,
  //     },
  //   });
  console.error("ERROR 💥:", {
    timestamp: new Date().toISOString(),
    method: req?.method || "UNKNOWN",
    url: req?.originalUrl || "UNKNOWN",
    ip: req?.ip || "UNKNOWN",
    userAgent: req?.get?.("User-Agent") || "UNKNOWN",
    error: {
      name: err.name || "Error",
      message: err.message || "Unknown error",
      stack: err.stack || "No stack trace",
      statusCode: err.statusCode || 500,
      code: err.code || null,
    },
  });

  // Handle PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      // Unique violation (duplicate key)
      case "23505":
        const field = err.detail?.match(/Key \((.+?)\)=/)?.[1] || "field";
        error = new ConflictError(`${field} already exists`);
        break;

      // Not null violation
      case "23502":
        const column = err.column || "required field";
        error = new ValidationError(`${column} is required`);
        break;

      // Foreign key violation
      case "23503":
        error = new ValidationError("Referenced record does not exist");
        break;

      // Check constraint violation
      case "23514":
        error = new ValidationError("Data violates database constraints");
        break;

      // Invalid input syntax
      case "22P02":
        error = new ValidationError("Invalid data format");
        break;

      // Connection errors
      case "ECONNREFUSED":
      case "ENOTFOUND":
      case "ETIMEDOUT":
        error = new ApiError("Database connection failed", 500);
        error.isOperational = false;
        break;
    }
  }

  // Special handling for common error types
  if (err.name === "ValidationError") {
    response.message = "Validation failed";
    response.errors = err.errors;
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again";
    error = new UnauthorizedError(message);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again";
    error = new UnauthorizedError(message);
  }

  const statusCode = error.statusCode || 500;
  // Determine the response based on environment
  //   if (process.env.NODE_ENV === "development") {
  //     // Development: Send detailed error info
  //     return res.status(err.statusCode).json({
  //       success: false,
  //       error: {
  //         name: err.name,
  //         message: err.message,
  //         statusCode: err.statusCode,
  //         stack: err.stack,
  //       },
  //       request: {
  //         method: req.method,
  //         url: req.originalUrl,
  //       },
  //     });
  //   }
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      error: {
        name: error.name || err.name || "Error",
        message: error.message || err.message || "Unknown error",
        statusCode: statusCode,
        stack: error.stack || err.stack,
        ...(error.errors && { errors: error.errors }),
        ...(err.code && { code: err.code }),
      },
      request: {
        method: req?.method || "UNKNOWN",
        url: req?.originalUrl || "UNKNOWN",
      },
    });
  }

  // Send error response
  //   if (error.isOperational) {
  //     // Operational errors: send message to client
  //     res.status(error.statusCode).json({
  //       success: false,
  //       message: error.message,
  //       ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  //     });
  //   } else {
  //     // Programming errors: don't leak details to client
  //     res.status(500).json({
  //       success: false,
  //       message: "Something went wrong on our end. Please try again later.",
  //     });
  //   }
  if (error.isOperational) {
    // Operational errors: safe to send to client
    const response = {
      success: false,
      message: error.message || "An error occurred",
    };

    if (error.errors) {
      response.errors = error.errors;
    }

    return res.status(statusCode).json(response);
  } else {
    // Programming errors: don't leak details
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = { errorHandler, asyncHandler };

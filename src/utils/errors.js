class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(resource) {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends ApiError {
  constructor(message, errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ConflictError extends ApiError {
  constructor(message) {
    super(message, 409);
  }
}

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  //   errorHandler: require("../middleware/errorHandler"),
};

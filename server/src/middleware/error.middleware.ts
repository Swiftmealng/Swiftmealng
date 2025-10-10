import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import Logger from "../utils/logger";

const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error
  Logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = new AppError("Resource not found", 404);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    error = new AppError(`${field} already exists`, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values((err as any).errors).map(
      (val: any) => val.message,
    );
    error = new AppError(messages.join(". "), 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError("Token expired. Please log in again", 401);
  }

  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Something went wrong"
      : error.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ValidationError, ValidationErrorItem } from "sequelize";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("ERROR:", err);

  if (err instanceof AppError) {
    return res.status(err.code || 400).json({
      success: false,
      key: err.key,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: err.errors.map((e: ValidationErrorItem) => e.message).join(", "),
    });
  }

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
}

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { Errors } from "../errors/error.catalog";

export const validate =
  (schema: ZodSchema, property: "body" | "params" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (err : any) {
        const message = err.errors.map((e : any) => e.message).join(", ");

        next(
          new AppError({
            key: Errors.VALIDATION_ERROR.key,
            code: Errors.VALIDATION_ERROR.code,
            message
          })
        );
        return;
      next(err);
    }
  };

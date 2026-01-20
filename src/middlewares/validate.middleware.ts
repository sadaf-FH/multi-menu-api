import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';

export const validate =
  (schema: ZodSchema, property: 'body' | 'params' | 'query' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const message = err.issues.map((issue) => issue.message).join(', ');

        return next(
          new AppError(Errors.VALIDATION_ERROR),
        );
      }

      return next(err);
    }
  };

import { Request, Response, NextFunction } from 'express';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res
      .status(err.code)
      .json(
        new ApiResponseBuilder()
          .failure(err.message)
          .withCode(err.code)
          .withMeta({ key: err.key })
          .build(),
      );
  }

  return res
    .status(500)
    .json(
      new ApiResponseBuilder()
        .failure(Errors.INTERNAL_SERVER_ERROR.message)
        .withCode(500)
        .withMeta({ key: Errors.INTERNAL_SERVER_ERROR.key })
        .build(),
    );
};

import { Request, Response } from 'express';
import * as RestaurantService from '../services/restaurant.service';
import { RESPONSE_CODES } from '../utils/constants';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { Success } from '../utils/success.catalog';

export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantService.createRestaurant(req.body);

  return res
    .status(Success.RESTAURANT_CREATED.code)
    .json(
      new ApiResponseBuilder<typeof restaurant>()
        .success(Success.RESTAURANT_CREATED.message)
        .withData(restaurant)
        .withCode(Success.RESTAURANT_CREATED.code)
        .build(),
    );
});

export const getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantService.getRestaurantById(req.params.id);

  if (!restaurant) {
    throw new AppError(Errors.RESTAURANT_NOT_FOUND);
  }

  return res.json(
    new ApiResponseBuilder<typeof restaurant>()
      .success(Success.RESTAURANT_FETCHED.message)
      .withData(restaurant)
      .withCode(Success.RESTAURANT_FETCHED.code)
      .build(),
  );
});

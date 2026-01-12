import { Request, Response } from 'express';
import * as RestaurantService from '../services/restaurant.service';
import { RESPONSE_CODES } from '../utils/constants';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';

export const createRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantService.createRestaurant(req.body);

  return res
    .status(RESPONSE_CODES.CREATED)
    .json(
      new ApiResponseBuilder<typeof restaurant>()
        .success('Restaurant created successfully')
        .withData(restaurant)
        .withCode(RESPONSE_CODES.CREATED)
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
      .success('Restaurant fetched successfully')
      .withData(restaurant)
      .withCode(RESPONSE_CODES.OK)
      .build(),
  );
});

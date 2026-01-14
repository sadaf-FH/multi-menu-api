import { Request, Response } from 'express';
import * as OfferService from '../services/offer.service';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { Success } from '../utils/success.catalog';
import { RestaurantRepository } from '../repositories/restaurant.repository';

export const createOfferController = asyncHandler(async (req: Request, res: Response) => {
  const offer = await OfferService.createOffer(req.body);

  return res
    .status(Success.OFFER_CREATED.code)
    .json(
      new ApiResponseBuilder<typeof offer>()
        .success(Success.OFFER_CREATED.message)
        .withData(offer)
        .withCode(Success.OFFER_CREATED.code)
        .build(),
    );
});

export const getOffersByItemController = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantRepository.findByItemId(req.params.id);
  if (!restaurant) throw new AppError(Errors.RESTAURANT_NOT_FOUND); 
  const offers = await OfferService.getOffersByItem(req.params.id, restaurant.R_ID);

  if (!offers || offers.length === 0) {
    throw new AppError(Errors.ITEM_NOT_FOUND);
  }

  return res.json(
    new ApiResponseBuilder<typeof offers>()
      .success(Success.OFFER_FETCHED.message)
      .withData(offers)
      .withCode(Success.OFFER_CREATED.code)
      .build(),
  );
});

export const getOffersByCategoryController = asyncHandler(async (req: Request, res: Response) => {
  const restaurant = await RestaurantRepository.findByCategoryId(req.params.id);
  if (!restaurant) throw new AppError(Errors.CATEGORY_NOT_FOUND);
  const offers = await OfferService.getOffersByCategory(req.params.id, restaurant.R_ID);

  if (!offers || offers.length === 0) {
    throw new AppError(Errors.CATEGORY_NOT_FOUND);
  }

  return res.json(
    new ApiResponseBuilder<typeof offers>()
      .success(Success.OFFER_FETCHED.message)
      .withData(offers)
      .withCode(Success.OFFER_FETCHED.code)
      .build(),
  );
});

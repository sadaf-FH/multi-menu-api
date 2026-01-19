import { OfferDbService } from './db/offer.dbservice';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { OfferType } from '../utils/constants';
import { MenuDbService } from './db/menu.dbservice';
import { DateTime } from 'luxon';

type CreateOfferInput = {
  item_id?: string;
  category_id?: string;
  type: OfferType;
  amount: number;
  max_discount?: number;
  available_from: string;
  available_to: string;
};

export const createOffer = async (data: CreateOfferInput) => {
  if (!data.item_id && !data.category_id) {
    throw new AppError(Errors.ITEM_OR_CATEGORY_REQUIRED);
  }

  if (data.type === OfferType.PERCENT && data.amount > 100) {
    throw new AppError({
      key: Errors.INVALID_OFFER_TYPE.key,
      code: Errors.INVALID_OFFER_TYPE.code,
      message: Errors.INVALID_OFFER_TYPE.message,
    });
  }

  const offer = await OfferDbService.createOffer({
    item_id: data.item_id ?? null,
    category_id: data.category_id ?? null,
    type: data.type,
    amount: data.amount,
    max_discount: data.max_discount,
    available_from: data.available_from,
    available_to: data.available_to,
  });

  return offer;
};

export const getOffersByItem = async (itemId: string, restaurantId: string) => {
  const restaurant = await MenuDbService.getRestaurantById(restaurantId);
  if (!restaurant) throw new AppError(Errors.RESTAURANT_NOT_FOUND);

  const currentTime = DateTime.now().setZone(restaurant.timezone).toFormat('HH:mm:ss');

  const offers = await OfferDbService.getOffersByItem(itemId, currentTime);

  if (!offers || offers.length === 0) {
    throw new AppError(Errors.OFFER_NOT_FOUND);
  }

  return offers;
};

export const getOffersByCategory = async (categoryId: string, restaurantId: string) => {
  const restaurant = await MenuDbService.getRestaurantById(restaurantId);
  if (!restaurant) throw new AppError(Errors.RESTAURANT_NOT_FOUND);

  const currentTime = DateTime.now().setZone(restaurant.timezone).toFormat('HH:mm:ss');

  const offers = await OfferDbService.getOffersByCategory(categoryId, currentTime);

  if (!offers || offers.length === 0) {
    throw new AppError(Errors.OFFER_NOT_FOUND);
  }

  return offers;
};

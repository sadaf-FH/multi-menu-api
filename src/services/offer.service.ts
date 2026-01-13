import { OfferDbService } from './db/offer.dbservice';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { OfferType } from '../utils/constants';

type CreateOfferInput = {
  item_id?: string;
  category_id?: string;
  type: OfferType;
  amount: number;
  max_discount?: number;
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
  });

  return offer;
};

export const getOffersByItem = async (itemId: string) => {
  const offers = await OfferDbService.getOffersByItem(itemId);
  if (!offers || offers.length === 0) {
    throw new AppError(Errors.ITEM_NOT_FOUND);
  }
  return offers;
};

export const getOffersByCategory = async (categoryId: string) => {
  const offers = await OfferDbService.getOffersByCategory(categoryId);
  if (!offers || offers.length === 0) {
    throw new AppError(Errors.CATEGORY_NOT_FOUND);
  }
  return offers;
};

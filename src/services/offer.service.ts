import { models } from "../models";
import { ERRORS, OfferType } from "../utils/constants";
import { CreateOfferInput } from "../utils/types";


export const createOffer = async (data: CreateOfferInput) => {
  if (!data.item_id && !data.category_id) {
    throw new Error(ERRORS.OFFER_LINKING_ERROR);
  }

  return models.Offer.create({
    item_id: data.item_id ?? null,
    category_id: data.category_id ?? null,
    type: data.type,
    amount: data.amount,
    max_discount: data.max_discount,
  });
};

export const getOffersByItem = async (itemId: string, itemPrice: number) => {
  const offers = await models.Offer.findAll({
    where: { item_id: itemId },
  });

  return offers.map((offer) => {
    let discount = 0;

    if (offer.type === OfferType.FLAT) {
      discount = Math.min(offer.amount, offer.max_discount);
    } else if (offer.type === OfferType.PERCENT) {
      discount = Math.min((itemPrice * offer.amount) / 100, offer.max_discount);
    }

    return {
      ...offer.get(),
      calculated_discount: discount,
    };
  });
};

export const getOffersByCategory = async (
  categoryId: string,
  itemPrice: number
) => {
  const offers = await models.Offer.findAll({
    where: { category_id: categoryId },
  });

  return offers.map((offer) => {
    let discount = 0;

    if (offer.type === OfferType.FLAT) {
      discount = Math.min(offer.amount, offer.max_discount);
    } else if (offer.type === OfferType.PERCENT) {
      discount = Math.min((itemPrice * offer.amount) / 100, offer.max_discount);
    }

    return {
      ...offer.get(),
      calculated_discount: discount,
    };
  });
};

import { OfferRepository } from "../repositories/offer.repository";
import { OfferType, ERRORS } from "../utils/constants";

type CreateOfferInput = {
  item_id?: string;
  category_id?: string;
  type: OfferType;
  amount: number;
  max_discount?: number;
};

export const createOffer = async (data: CreateOfferInput) => {
  if (!data.item_id && !data.category_id) {
    throw new Error(ERRORS.ITEM_OR_CATEGORY_REQUIRED);
  }

  if (data.type === OfferType.PERCENT && data.amount > 100) {
    throw new Error("Percentage discount cannot exceed 100");
  }

  return OfferRepository.create({
    item_id: data.item_id ?? null,
    category_id: data.category_id ?? null,
    type: data.type,
    amount: data.amount,
    max_discount: data.max_discount ?? undefined,
  });
};

export const getOffersByItem = async (itemId: string) => {
  return OfferRepository.findByItemId(itemId);
};

export const getOffersByCategory = async (categoryId: string) => {
  return OfferRepository.findByCategoryId(categoryId);
};

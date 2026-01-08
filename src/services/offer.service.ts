import { models } from "../models";

type CreateOfferInput = {
  item_id?: string;
  category_id?: string;
  type: "FLAT" | "PERCENT";
  max_discount: number;
};

export const createOffer = async (data: CreateOfferInput) => {
  if (!data.item_id && !data.category_id) {
    throw new Error("Offer must be linked to item or category");
  }

  return models.Offer.create({
    item_id: data.item_id ?? null,
    category_id: data.category_id ?? null,
    type: data.type,
    max_discount: data.max_discount,
  });
};

export const getOffersByCategory = async (categoryId: string) => {
  return models.Offer.findAll({
    where: { category_id: categoryId },
  });
};

export const getOffersByItem = async (itemId: string) => {
  return models.Offer.findAll({
    where: { item_id: itemId },
  });
};

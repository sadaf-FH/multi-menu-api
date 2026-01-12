import { models } from '../models';
import { Offer } from '../models/Offer';

export const OfferRepository = {
  create: async (data: Partial<Offer>) => {
    return models.Offer.create(data);
  },

  findByItemId: async (itemId: string) => {
    return models.Offer.findAll({
      where: { item_id: itemId },
    });
  },

  findByCategoryId: async (categoryId: string) => {
    return models.Offer.findAll({
      where: { category_id: categoryId },
    });
  },
};

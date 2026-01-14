import { Op } from 'sequelize';
import { models } from '../models';
import { Offer } from '../models/Offer';

export const OfferRepository = {
  create: async (data: Partial<Offer>) => {
    return models.Offer.create(data);
  },

  findByItemId(itemId: string, time: string) {
    return models.Offer.findAll({
      where: {
        item_id: itemId,
        [Op.or]: [
          { available_from: null, available_to: null },
          {
            available_from: { [Op.lte]: time },
            available_to: { [Op.gte]: time },
          },
        ],
      },
    });
  },
  
  findByCategoryId(categoryId: string, time: string) {
    return models.Offer.findAll({
      where: {
        category_id: categoryId,
        [Op.or]: [
          { available_from: null, available_to: null },
          {
            available_from: { [Op.lte]: time },
            available_to: { [Op.gte]: time },
          },
        ],
      },
    });
  },
};

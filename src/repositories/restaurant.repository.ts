import { models } from '../models';
import { Restaurant } from '../models/Restaurant';

export const RestaurantRepository = {
  create(data: Partial<Restaurant>) {
    return models.Restaurant.create(data);
  },

  findById(id: string) {
    return models.Restaurant.findByPk(id);
  },
  async findByItemId(itemId: string) {
    return models.Restaurant.findOne({
      include: [
        {
          model: models.Menu,
          required: true,
          include: [
            {
              model: models.Category,
              required: true,
              include: [
                {
                  model: models.Item,
                  where: { item_id: itemId },
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });
  },
  async findByCategoryId(categoryId: string) {
    return models.Restaurant.findOne({
      include: [
        {
          model: models.Menu,
          required: true,
          include: [
            {
              model: models.Category,
              where: { category_id: categoryId },
              required: true,
            },
          ],
        },
      ],
    });
  },
};

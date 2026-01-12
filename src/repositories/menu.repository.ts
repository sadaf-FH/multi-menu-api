import { models, sequelize } from '../models';
import { col, Op, Transaction, where } from 'sequelize';
import { Menu } from '../models/Menu';
import { Category } from '../models/Category';
import { Item } from '../models/Item';
import { ItemPrice } from '../models/ItemPrice';
import { AddOn } from '../models/AddOn';

export const MenuRepository = {
  create(data: any, transaction?: Transaction) {
    return models.Menu.create(data, { transaction });
  },

async findByRestaurant(restaurantId: string, currentTime: string) {
  return Menu.findOne({
    where: { R_ID: restaurantId },
    include: [
      {
        model: Category,
        include: [
          {
            model: Item,
            required: false,
            where: {
              [Op.or]: [
                // Items without time
                {
                  available_from: null,
                  available_to: null,
                },

                // Normal same-day window
                {
                  available_from: { [Op.lte]: currentTime },
                  available_to: { [Op.gte]: currentTime },
                },

                // Overnight window
                {
                  [Op.and]: [
                    { available_from: { [Op.gt]: col('available_to') } },
                    {
                      [Op.or]: [
                        { available_from: { [Op.lte]: currentTime } },
                        { available_to: { [Op.gte]: currentTime } },
                      ],
                    },
                  ],
                },
              ],
            },
            include: [ItemPrice, AddOn],
          },
        ],
      },
    ],
  });
}
};

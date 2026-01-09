import { models, sequelize } from "../models";
import { Transaction } from "sequelize";

export const MenuRepository = {
  create(data: any, transaction?: Transaction) {
    return models.Menu.create(data, { transaction });
  },

  findByRestaurant(restaurantId: string) {
    return models.Menu.findOne({
      where: { R_ID: restaurantId },
      include: [
        {
          model: models.Category,
          include: [
            {
              model: models.Item,
              include: [models.ItemPrice, models.AddOn],
            },
          ],
        },
      ],
    });
  },
};

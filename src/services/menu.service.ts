import { sequelize, models } from "../models";
import { col, Op } from "sequelize";
import { DateTime } from "luxon"; 
import { ERRORS } from "../utils/constants";

export const createMenu = async (data: any) => {
  const t = await sequelize.transaction();

  try {
    const { restaurantId, version, categories } = data;

    const menu = await models.Menu.create(
      { R_ID: restaurantId, version },
      { transaction: t }
    );

    for (const cat of categories) {
      const category = await models.Category.create(
        {
          menu_id: menu.menu_id,
          name: cat.name,
          avg_price: cat.avg_price,
          item_count: cat.items.length,
        },
        { transaction: t }
      );

      for (const itm of cat.items) {
        let availableFrom: string | null = null;
        let availableTo: string | null = null;
        if (itm.time) {
          availableFrom = itm.time.available_from || null;
          availableTo = itm.time.available_to || null;
        }

        const item = await models.Item.create(
          {
            category_id: category.category_id,
            available_from: availableFrom,
            available_to: availableTo,
          },
          { transaction: t }
        );

        for (const price of itm.prices) {
          await models.ItemPrice.create(
            {
              item_id: item.item_id,
              order_type: price.order_type,
              price: price.price,
            },
            { transaction: t }
          );
        }

        if (itm.addons) {
          await models.AddOn.create(
            {
              item_id: item.item_id,
              min_quantity: itm.addons.min_quantity,
              max_quantity: itm.addons.max_quantity,
              required: itm.addons.required,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();
    return { menu_id: menu.menu_id };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const getMenuByRestaurant = async (restaurantId: string) => {
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
};

export const getMenuByRestaurantWithTimeFilter = async (restaurantId: string) => {
  const restaurant = await models.Restaurant.findByPk(restaurantId);
  if (!restaurant) throw new Error(ERRORS.RESTAURANT_NOT_FOUND);

  const tz = restaurant.timezone || "UTC";
  const currentTime = DateTime.utc().setZone(tz).toFormat("HH:mm:ss");

  return models.Menu.findOne({
    where: { R_ID: restaurantId },
    include: [
      {
        model: models.Category,
        include: [
          {
            model: models.Item,
            where: {
              [Op.or]: [
                {
                  available_from: null,
                  available_to: null,
                },
                {
                  available_from: { [Op.lte]: currentTime },
                  available_to: { [Op.gte]: currentTime },
                },
                {
                  [Op.and]: [
                    { available_from: { [Op.gt]: col("available_to") } },
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
            required: false,
            include: [models.ItemPrice, models.AddOn],
          },
        ],
      },
    ],
  });
};

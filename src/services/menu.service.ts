import { sequelize, models } from "../models";

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
        const item = await models.Item.create(
          {
            category_id: category.category_id,
            time: itm.time,
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

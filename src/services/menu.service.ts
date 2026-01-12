import { sequelize } from "../models";
import { DateTime } from "luxon";
import {
  MenuRepository,
} from "../repositories/menu.repository";
import {
  CategoryRepository,
  ItemRepository,
  ItemPriceRepository,
  AddOnRepository,
} from "../repositories/item.repository";
import { RestaurantRepository } from "../repositories/restaurant.repository";

export const createMenu = async (data: any) => {
  const t = await sequelize.transaction();

  try {
    const menu = await MenuRepository.create(
      { R_ID: data.restaurantId, version: data.version },
      t
    );

    for (const cat of data.categories) {
      const category = await CategoryRepository.create(
        {
          menu_id: menu.menu_id,
          name: cat.name,
          avg_price: cat.avg_price,
          item_count: cat.items.length,
        },
        t
      );

      for (const itm of cat.items) {
        const item = await ItemRepository.create(
          {
            category_id: category.category_id,
            available_from: itm.time?.available_from ?? null,
            available_to: itm.time?.available_to ?? null,
          },
          t
        );

        await ItemPriceRepository.bulkCreate(
          itm.prices.map((p: any) => ({
            item_id: item.item_id,
            order_type: p.order_type,
            price: p.price,
          })),
          t
        );

        if (itm.addons) {
          await AddOnRepository.create(
            { item_id: item.item_id, ...itm.addons },
            t
          );
        }
      }
    }

    await t.commit();
    return menu;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const getMenuWithTimeFilter = async (restaurantId: string) => {
  const restaurant = await RestaurantRepository.findById(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  const currentTime = DateTime.now()
    .setZone(restaurant.timezone)
    .toFormat("HH:mm:ss");

  return MenuRepository.findByRestaurant(restaurantId);
};

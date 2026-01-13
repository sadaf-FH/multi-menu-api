import { MenuRepository } from '../../repositories/menu.repository';
import {
  CategoryRepository,
  ItemRepository,
  ItemPriceRepository,
  AddOnRepository,
} from '../../repositories/item.repository';
import { RestaurantRepository } from '../../repositories/restaurant.repository';
import { sequelize } from '../../models';
import { DateTime } from 'luxon';

export const MenuDbService = {
  async createMenuWithCategoriesAndItems(menuData: any) {
    const t = await sequelize.transaction();

    try {
      const menu = await MenuRepository.create(
        { R_ID: menuData.restaurantId, version: menuData.version },
        t,
      );

      for (const cat of menuData.categories) {
        const category = await CategoryRepository.create(
          {
            menu_id: menu.menu_id,
            name: cat.name,
            avg_price: cat.avg_price,
            item_count: cat.items.length,
          },
          t,
        );

        for (const itm of cat.items) {
          const item = await ItemRepository.create(
            {
              category_id: category.category_id,
              available_from: itm.time?.available_from ?? null,
              available_to: itm.time?.available_to ?? null,
            },
            t,
          );

          await ItemPriceRepository.bulkCreate(
            itm.prices.map((p: any) => ({
              item_id: item.item_id,
              order_type: p.order_type,
              price: p.price,
            })),
            t,
          );

          if (itm.addons) {
            await AddOnRepository.create({ item_id: item.item_id, ...itm.addons }, t);
          }
        }
      }

      await t.commit();
      return menu;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async getMenuByRestaurant(restaurantId: string, currentTime: string) {
    return MenuRepository.findByRestaurant(restaurantId, currentTime);
  },

  async getRestaurantById(restaurantId: string) {
    return RestaurantRepository.findById(restaurantId);
  },
};

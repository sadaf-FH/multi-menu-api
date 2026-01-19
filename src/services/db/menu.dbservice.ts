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
import { QueryTypes } from 'sequelize';
import { ItemTimezoneRow } from '../../utils/types';

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
          const item = await ItemRepository.create({
            category_id: category.category_id,
            name: itm.name,
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

  async getTimezoneForItem(itemId: string): Promise<ItemTimezoneRow[]> {
    return sequelize.query(
      `
        SELECT r.timezone
        FROM Items i
        JOIN Categories c ON i.category_id = c.category_id
        JOIN Menus m ON c.menu_id = m.menu_id
        JOIN Restaurants r ON m.R_ID = r.R_ID
        WHERE i.item_id = :itemId
        LIMIT 1
    `,
      {
        replacements: { itemId },
        type: QueryTypes.SELECT,
      },
    );
  },

  async getMenuByRestaurant(restaurantId: string) {
    return MenuRepository.findByRestaurant(restaurantId);
  },

  async getRestaurantById(restaurantId: string) {
    return RestaurantRepository.findById(restaurantId);
  },
};

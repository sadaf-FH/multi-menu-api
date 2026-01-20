import { MenuRepository } from '../../repositories/menu.repository';
import {
  CategoryRepository,
  ItemRepository,
  ItemPriceRepository,
  AddOnRepository,
} from '../../repositories/item.repository';
import { RestaurantRepository } from '../../repositories/restaurant.repository';
import { sequelize } from '../../models';
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

    const categoryPayload = menuData.categories.map((cat: any) => ({
      menu_id: menu.menu_id,
      name: cat.name,
      avg_price: cat.avg_price,
      item_count: cat.items.length,
    }));

    const categories = await CategoryRepository.bulkCreate(categoryPayload, t);

    const categoryIdMap = new Map<string, string>();
    categories.forEach((c, i) => {
      categoryIdMap.set(menuData.categories[i].name, c.category_id);
    });

    const itemsPayload: any[] = [];

    menuData.categories.forEach((cat: any) => {
      const categoryId = categoryIdMap.get(cat.name)!;

      cat.items.forEach((itm: any) => {
        itemsPayload.push({
          category_id: categoryId,
          name: itm.name,
          available_from: itm.time?.available_from ?? null,
          available_to: itm.time?.available_to ?? null,
        });
      });
    });

    const items = await ItemRepository.bulkCreate(itemsPayload, t);

    const pricesPayload: any[] = [];
    let itemIndex = 0;

    menuData.categories.forEach((cat: any) => {
      cat.items.forEach((itm: any) => {
        const itemId = items[itemIndex].item_id;

        itm.prices.forEach((p: any) => {
          pricesPayload.push({
            item_id: itemId,
            order_type: p.order_type,
            price: p.price,
          });
        });

        itemIndex++;
      });
    });

    await ItemPriceRepository.bulkCreate(pricesPayload, t);

    const addonsPayload: any[] = [];
    itemIndex = 0;

    menuData.categories.forEach((cat: any) => {
      cat.items.forEach((itm: any) => {
        if (itm.addons) {
          addonsPayload.push({
            item_id: items[itemIndex].item_id,
            ...itm.addons,
          });
        }
        itemIndex++;
      });
    });

    if (addonsPayload.length) {
      await AddOnRepository.bulkCreate(addonsPayload, t);
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

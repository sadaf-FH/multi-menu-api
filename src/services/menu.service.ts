import { MenuDbService } from './db/menu.dbservice';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { DateTime } from 'luxon';

export const createMenu = async (data: any) => {
  try {
    const menu = await MenuDbService.createMenuWithCategoriesAndItems(data);
    return menu;
  } catch (err: any) {
    throw new AppError({
      key: Errors.MENU_CREATION_FAILURE.key,
      code: Errors.MENU_CREATION_FAILURE.code,
      message: err.message || Errors.MENU_CREATION_FAILURE.message,
    });
  }
};

export const getMenuWithTimeFilter = async (restaurantId: string) => {
  const restaurant = await MenuDbService.getRestaurantById(restaurantId);
  if (!restaurant) throw new AppError(Errors.RESTAURANT_NOT_FOUND);

  const currentTime = DateTime.now().setZone(restaurant.timezone).toFormat('HH:mm:ss');

  const menu = await MenuDbService.getMenuByRestaurant(restaurantId);
  if (!menu) throw new AppError(Errors.MENU_NOT_FOUND);

  return menu;
};

import { MenuDbService } from './db/menu.dbservice';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { DateTime } from 'luxon';
import { enrichItemPricesWithOffers } from './offerResolver.service';
import { OfferDbService } from './db/offer.dbservice';
import { applyBestOffer } from './pricing.service';

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

  const currentTime = DateTime
    .now()
    .setZone(restaurant.timezone)
    .toFormat('HH:mm:ss');

  const menu = await MenuDbService.getMenuByRestaurant(
    restaurantId,
    currentTime
  );

  if (!menu) throw new AppError(Errors.MENU_NOT_FOUND);

  for (const category of menu.Categories ?? []) {
    const categoryOffers = await OfferDbService.getOffersByCategory(
      category.category_id,
      currentTime
    );

    for (const item of category.Items ?? []) {
      const itemOffers = await OfferDbService.getOffersByItem(
        item.item_id,
        currentTime
      );

      const applicableOffers =
        itemOffers.length > 0 ? itemOffers : categoryOffers;

      for (const price of item.ItemPrices ?? []) {
        const { finalPrice, discount, appliedOffer } = applyBestOffer(
          price.price,
          applicableOffers
        );

        price.dataValues.base_price = price.price;
        price.dataValues.final_price = finalPrice;
        price.dataValues.discount = discount;
        price.dataValues.applied_offer = appliedOffer;
      }
    }
  }

  return menu;
};

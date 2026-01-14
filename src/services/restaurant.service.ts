import { RestaurantDbService } from './db/restaurant.dbservice';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';

type CreateRestaurantInput = {
  name: string;
  franchise?: string | null;
  location: string;
  timezone?: string;
};

export const createRestaurant = async (data: CreateRestaurantInput) => {
  try {
    const restaurant = await RestaurantDbService.createRestaurant(data);
    return restaurant;
  } catch (err: any) {
    throw new AppError({
      key: Errors.RESTAURANT_CREATION_FAILURE.key,
      code: Errors.RESTAURANT_CREATION_FAILURE.code,
      message: err.message || Errors.RESTAURANT_CREATION_FAILURE.message,
    });
  }
};

export const getRestaurantById = async (id: string) => {
  const restaurant = await RestaurantDbService.getRestaurantById(id);

  if (!restaurant) {
    throw new AppError(Errors.RESTAURANT_NOT_FOUND);
  }

  return restaurant;
};

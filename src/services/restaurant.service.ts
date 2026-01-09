import { RestaurantRepository } from "../repositories/restaurant.repository";
import { ERRORS } from "../utils/constants";

type CreateRestaurantInput = {
  name: string;
  franchise?: string | null;
  location: string;
  available?: boolean;
  timezone?: string;
};

export const createRestaurant = async (data: CreateRestaurantInput) => {
  return RestaurantRepository.create({
    name: data.name,
    franchise: data.franchise ?? null,
    location: data.location,
    available: data.available ?? true,
    timezone: data.timezone ?? "UTC",
  });
};

export const getRestaurantById = async (id: string) => {
  const restaurant = await RestaurantRepository.findById(id);

  if (!restaurant) {
    throw new Error(ERRORS.RESTAURANT_NOT_FOUND);
  }

  return restaurant;
};

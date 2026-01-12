import { models } from "../models";
import { CreateRestaurantInput } from "../utils/types";

export const createRestaurant = async (data: CreateRestaurantInput) => {
  return models.Restaurant.create({
    name: data.name,
    franchise: data.franchise ?? null,
    location: data.location,
    available: true,
    timezone: data.timezone
  });
};

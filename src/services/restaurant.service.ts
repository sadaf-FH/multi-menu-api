import { models } from "../models";

type CreateRestaurantInput = {
  name: string;
  franchise?: string;
  location: string;
};

export const createRestaurant = async (data: CreateRestaurantInput) => {
  return models.Restaurant.create({
    name: data.name,
    franchise: data.franchise ?? null,
    location: data.location,
    available: true,
  });
};

import { models } from "../models";
import { Restaurant } from "../models/Restaurant";

export const RestaurantRepository = {
  create(data: Partial<Restaurant>) {
    return models.Restaurant.create(data);
  },

  findById(id: string) {
    return models.Restaurant.findByPk(id);
  },
};

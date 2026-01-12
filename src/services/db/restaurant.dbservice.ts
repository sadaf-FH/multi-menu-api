import { RestaurantRepository } from '../../repositories/restaurant.repository';

export const RestaurantDbService = {
  async createRestaurant(data: {
    name: string;
    franchise?: string | null;
    location: string;
    available?: boolean;
    timezone?: string;
  }) {
    return RestaurantRepository.create({
      name: data.name,
      franchise: data.franchise ?? null,
      location: data.location,
      available: data.available ?? true,
      timezone: data.timezone ?? 'UTC',
    });
  },

  async getRestaurantById(id: string) {
    return RestaurantRepository.findById(id);
  },
};

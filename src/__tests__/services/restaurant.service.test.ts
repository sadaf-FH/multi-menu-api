jest.mock('../../services/db/restaurant.dbservice', () => ({
  RestaurantDbService: {
    createRestaurant: jest.fn(),
    getRestaurantById: jest.fn(),
  },
}));

import { createRestaurant, getRestaurantById } from '../../services/restaurant.service';
import { RestaurantDbService } from '../../services/db/restaurant.dbservice';
import { AppError } from '../../errors/AppError';
import { Errors } from '../../errors/error.catalog';

describe('Restaurant Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRestaurant', () => {
    const mockRestaurantData = {
      name: 'Test Restaurant',
      franchise: 'Test Franchise',
      location: 'Test Location',
      timezone: 'Asia/Kolkata',
    };

    const mockCreatedRestaurant = {
      R_ID: 'restaurant-123',
      ...mockRestaurantData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('successfully creates a restaurant with all fields', async () => {
      jest
        .spyOn(RestaurantDbService, 'createRestaurant')
        .mockResolvedValue(mockCreatedRestaurant as any);

      const result = await createRestaurant(mockRestaurantData);

      expect(RestaurantDbService.createRestaurant).toHaveBeenCalledWith(
        mockRestaurantData,
      );
      expect(RestaurantDbService.createRestaurant).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedRestaurant);
    });

    it('successfully creates a restaurant without optional fields', async () => {
      const minimalData = {
        name: 'Minimal Restaurant',
        location: 'Minimal Location',
      };

      const mockMinimalRestaurant = {
        R_ID: 'restaurant-456',
        ...minimalData,
        franchise: null,
        timezone: 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(RestaurantDbService, 'createRestaurant')
        .mockResolvedValue(mockMinimalRestaurant as any);

      const result = await createRestaurant(minimalData);

      expect(RestaurantDbService.createRestaurant).toHaveBeenCalledWith(
        minimalData,
      );
      expect(result).toEqual(mockMinimalRestaurant);
    });

    it('throws AppError when database operation fails', async () => {
      const dbError = new Error('Database connection failed');

      jest
        .spyOn(RestaurantDbService, 'createRestaurant')
        .mockRejectedValue(dbError);

      await expect(createRestaurant(mockRestaurantData)).rejects.toThrow(
        AppError,
      );

      try {
        await createRestaurant(mockRestaurantData);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(
          Errors.RESTAURANT_CREATION_FAILURE.key,
        );
        expect((error as AppError).code).toBe(
          Errors.RESTAURANT_CREATION_FAILURE.code,
        );
        expect((error as AppError).message).toBe(
          Errors.RESTAURANT_CREATION_FAILURE.message,
        );
      }
    });

    it('throws AppError when validation fails', async () => {
      const validationError = new Error('Validation failed');

      jest
        .spyOn(RestaurantDbService, 'createRestaurant')
        .mockRejectedValue(validationError);

      await expect(createRestaurant(mockRestaurantData)).rejects.toThrow(
        AppError,
      );
    });

    it('handles null franchise value', async () => {
      const dataWithNullFranchise = {
        name: 'Independent Restaurant',
        franchise: null,
        location: 'Downtown',
        timezone: 'America/New_York',
      };

      const mockResult = {
        R_ID: 'restaurant-789',
        ...dataWithNullFranchise,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(RestaurantDbService, 'createRestaurant')
        .mockResolvedValue(mockResult as any);

      const result = await createRestaurant(dataWithNullFranchise);

      expect(result.franchise).toBeNull();
      expect(RestaurantDbService.createRestaurant).toHaveBeenCalledWith(
        dataWithNullFranchise,
      );
    });
  });

  describe('getRestaurantById', () => {
    const restaurantId = 'restaurant-123';
    const mockRestaurant = {
      R_ID: restaurantId,
      name: 'Test Restaurant',
      franchise: 'Test Franchise',
      location: 'Test Location',
      timezone: 'Asia/Kolkata',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('successfully retrieves a restaurant by ID', async () => {
      jest
        .spyOn(RestaurantDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      const result = await getRestaurantById(restaurantId);

      expect(RestaurantDbService.getRestaurantById).toHaveBeenCalledWith(
        restaurantId,
      );
      expect(RestaurantDbService.getRestaurantById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRestaurant);
    });

    it('throws AppError when restaurant is not found', async () => {
      jest
        .spyOn(RestaurantDbService, 'getRestaurantById')
        .mockResolvedValue(null);

      await expect(getRestaurantById(restaurantId)).rejects.toThrow(AppError);

      try {
        await getRestaurantById(restaurantId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.RESTAURANT_NOT_FOUND.key);
        expect((error as AppError).code).toBe(Errors.RESTAURANT_NOT_FOUND.code);
        expect((error as AppError).message).toBe(
          Errors.RESTAURANT_NOT_FOUND.message,
        );
      }
    });

    it('throws AppError when restaurant is undefined', async () => {
      jest
        .spyOn(RestaurantDbService, 'getRestaurantById')
        .mockResolvedValue(undefined as any);

      await expect(getRestaurantById(restaurantId)).rejects.toThrow(AppError);

      try {
        await getRestaurantById(restaurantId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.RESTAURANT_NOT_FOUND.key);
      }
    });

    it('handles database errors gracefully', async () => {
      const dbError = new Error('Database connection lost');

      jest
        .spyOn(RestaurantDbService, 'getRestaurantById')
        .mockRejectedValue(dbError);

      await expect(getRestaurantById(restaurantId)).rejects.toThrow(dbError);
    });

    it('retrieves restaurant with null franchise', async () => {
      const restaurantWithNullFranchise = {
        ...mockRestaurant,
        franchise: null,
      };

      jest
        .spyOn(RestaurantDbService, 'getRestaurantById')
        .mockResolvedValue(restaurantWithNullFranchise as any);

      const result = await getRestaurantById(restaurantId);

      expect(result.franchise).toBeNull();
      expect(result.R_ID).toBe(restaurantId);
    });

    it('handles different valid restaurant IDs', async () => {
      const testIds = ['rest-1', 'rest-abc-123', 'uuid-format-id'];

      for (const testId of testIds) {
        const mockData = { ...mockRestaurant, R_ID: testId };

        jest
          .spyOn(RestaurantDbService, 'getRestaurantById')
          .mockResolvedValue(mockData as any);

        const result = await getRestaurantById(testId);

        expect(result.R_ID).toBe(testId);
        expect(RestaurantDbService.getRestaurantById).toHaveBeenCalledWith(
          testId,
        );
      }
    });
  });
});
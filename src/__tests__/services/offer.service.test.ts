jest.mock('../../services/db/offer.dbservice', () => ({
  OfferDbService: {
    createOffer: jest.fn(),
    getOffersByItem: jest.fn(),
    getOffersByCategory: jest.fn(),
  },
}));

jest.mock('../../services/db/menu.dbservice', () => ({
  MenuDbService: {
    getRestaurantById: jest.fn(),
  },
}));

import {
  createOffer,
  getOffersByItem,
  getOffersByCategory,
} from '../../services/offer.service';
import { OfferDbService } from '../../services/db/offer.dbservice';
import { MenuDbService } from '../../services/db/menu.dbservice';
import { AppError } from '../../errors/AppError';
import { Errors } from '../../errors/error.catalog';
import { OfferType } from '../../utils/constants';
import { DateTime } from 'luxon';

describe('Offer Service', () => {
  let dateTimeSpy: jest.SpyInstance;

  // Fixed time for all tests: 2024-01-01 at 14:00:00 (2:00 PM) in Asia/Kolkata
  const FIXED_TIME_RAW = DateTime.fromISO('2024-01-01T14:00:00', {
    zone: 'Asia/Kolkata',
  });

  if (!FIXED_TIME_RAW.isValid) {
    throw new Error('Invalid FIXED_TIME setup in tests');
  }

  const FIXED_TIME = FIXED_TIME_RAW as DateTime<true>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock DateTime.now() to return fixed time
    dateTimeSpy = jest.spyOn(DateTime, 'now').mockReturnValue(FIXED_TIME);
  });

  afterEach(() => {
    dateTimeSpy.mockRestore();
  });

  describe('createOffer', () => {
    const mockItemOffer = {
      offer_id: 'offer-123',
      item_id: 'item-1',
      category_id: null,
      type: OfferType.PERCENT,
      amount: 20,
      max_discount: 100,
      available_from: '10:00:00',
      available_to: '18:00:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCategoryOffer = {
      offer_id: 'offer-456',
      item_id: null,
      category_id: 'cat-1',
      type: OfferType.FLAT,
      amount: 50,
      max_discount: undefined,
      available_from: '09:00:00',
      available_to: '21:00:00',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('successfully creates an item-level percent offer', async () => {
      const offerData = {
        item_id: 'item-1',
        type: OfferType.PERCENT,
        amount: 20,
        max_discount: 100,
        available_from: '10:00:00',
        available_to: '18:00:00',
      };

      jest
        .spyOn(OfferDbService, 'createOffer')
        .mockResolvedValue(mockItemOffer as any);

      const result = await createOffer(offerData);

      expect(OfferDbService.createOffer).toHaveBeenCalledWith({
        item_id: 'item-1',
        category_id: null,
        type: OfferType.PERCENT,
        amount: 20,
        max_discount: 100,
        available_from: '10:00:00',
        available_to: '18:00:00',
      });
      expect(result).toEqual(mockItemOffer);
    });

    it('successfully creates a category-level flat offer', async () => {
      const offerData = {
        category_id: 'cat-1',
        type: OfferType.FLAT,
        amount: 50,
        available_from: '09:00:00',
        available_to: '21:00:00',
      };

      jest
        .spyOn(OfferDbService, 'createOffer')
        .mockResolvedValue(mockCategoryOffer as any);

      const result = await createOffer(offerData);

      expect(OfferDbService.createOffer).toHaveBeenCalledWith({
        item_id: null,
        category_id: 'cat-1',
        type: OfferType.FLAT,
        amount: 50,
        max_discount: undefined,
        available_from: '09:00:00',
        available_to: '21:00:00',
      });
      expect(result).toEqual(mockCategoryOffer);
    });

    it('throws AppError when neither item_id nor category_id is provided', async () => {
      const offerData = {
        type: OfferType.PERCENT,
        amount: 20,
        available_from: '10:00:00',
        available_to: '18:00:00',
      };

      await expect(createOffer(offerData)).rejects.toThrow(AppError);

      try {
        await createOffer(offerData);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(
          Errors.ITEM_OR_CATEGORY_REQUIRED.key,
        );
        expect((error as AppError).code).toBe(
          Errors.ITEM_OR_CATEGORY_REQUIRED.code,
        );
      }
    });

    it('throws AppError when percent offer amount exceeds 100', async () => {
      const offerData = {
        item_id: 'item-1',
        type: OfferType.PERCENT,
        amount: 150,
        available_from: '10:00:00',
        available_to: '18:00:00',
      };

      await expect(createOffer(offerData)).rejects.toThrow(AppError);

      try {
        await createOffer(offerData);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.INVALID_OFFER_TYPE.key);
        expect((error as AppError).code).toBe(Errors.INVALID_OFFER_TYPE.code);
      }
    });

    it('accepts percent offer with amount equal to 100', async () => {
      const offerData = {
        item_id: 'item-1',
        type: OfferType.PERCENT,
        amount: 100,
        available_from: '10:00:00',
        available_to: '18:00:00',
      };

      const mockOffer = { ...mockItemOffer, amount: 100 };

      jest
        .spyOn(OfferDbService, 'createOffer')
        .mockResolvedValue(mockOffer as any);

      const result = await createOffer(offerData);

      expect(result.amount).toBe(100);
      expect(OfferDbService.createOffer).toHaveBeenCalled();
    });

    it('accepts flat offer with amount greater than 100', async () => {
      const offerData = {
        category_id: 'cat-1',
        type: OfferType.FLAT,
        amount: 500,
        available_from: '10:00:00',
        available_to: '18:00:00',
      };

      const mockOffer = { ...mockCategoryOffer, amount: 500 };

      jest
        .spyOn(OfferDbService, 'createOffer')
        .mockResolvedValue(mockOffer as any);

      const result = await createOffer(offerData);

      expect(result.amount).toBe(500);
      expect(OfferDbService.createOffer).toHaveBeenCalled();
    });

    it('handles offer with max_discount specified', async () => {
      const offerData = {
        item_id: 'item-1',
        type: OfferType.PERCENT,
        amount: 25,
        max_discount: 150,
        available_from: '10:00:00',
        available_to: '18:00:00',
      };

      jest
        .spyOn(OfferDbService, 'createOffer')
        .mockResolvedValue(mockItemOffer as any);

      await createOffer(offerData);

      expect(OfferDbService.createOffer).toHaveBeenCalledWith(
        expect.objectContaining({
          max_discount: 150,
        }),
      );
    });
  });

  describe('getOffersByItem', () => {
    const itemId = 'item-1';
    const restaurantId = 'restaurant-123';

    const mockRestaurant = {
      R_ID: restaurantId,
      name: 'Test Restaurant',
      timezone: 'Asia/Kolkata',
    };

    const mockOffers = [
      {
        offer_id: 'offer-1',
        item_id: itemId,
        type: OfferType.PERCENT,
        amount: 20,
        max_discount: 100,
        available_from: '10:00:00',
        available_to: '18:00:00',
      },
      {
        offer_id: 'offer-2',
        item_id: itemId,
        type: OfferType.FLAT,
        amount: 50,
        available_from: '12:00:00',
        available_to: '20:00:00',
      },
    ];

    it('successfully retrieves offers for an item', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(mockOffers as any);

      const result = await getOffersByItem(itemId, restaurantId);

      expect(MenuDbService.getRestaurantById).toHaveBeenCalledWith(
        restaurantId,
      );
      expect(OfferDbService.getOffersByItem).toHaveBeenCalledWith(
        itemId,
        '14:00:00', // Fixed time formatted
      );
      expect(result).toEqual(mockOffers);
      expect(result).toHaveLength(2);
    });

    it('throws AppError when restaurant is not found', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(null);

      await expect(getOffersByItem(itemId, restaurantId)).rejects.toThrow(
        AppError,
      );

      try {
        await getOffersByItem(itemId, restaurantId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.RESTAURANT_NOT_FOUND.key);
      }
    });

    it('throws AppError when no offers are found', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await expect(getOffersByItem(itemId, restaurantId)).rejects.toThrow(
        AppError,
      );

      try {
        await getOffersByItem(itemId, restaurantId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.OFFER_NOT_FOUND.key);
      }
    });

    it('throws AppError when offers are null', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(null as any);

      await expect(getOffersByItem(itemId, restaurantId)).rejects.toThrow(
        AppError,
      );
    });

    it('uses restaurant timezone for time calculation', async () => {
      const restaurantInDifferentTimezone = {
        ...mockRestaurant,
        timezone: 'America/New_York',
      };

      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(restaurantInDifferentTimezone as any);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(mockOffers as any);

      await getOffersByItem(itemId, restaurantId);

      // Time should be converted to America/New_York timezone
      const expectedTime = FIXED_TIME.setZone('America/New_York').toFormat(
        'HH:mm:ss',
      );
      expect(OfferDbService.getOffersByItem).toHaveBeenCalledWith(
        itemId,
        expectedTime,
      );
    });
  });

  describe('getOffersByCategory', () => {
    const categoryId = 'cat-1';
    const restaurantId = 'restaurant-123';

    const mockRestaurant = {
      R_ID: restaurantId,
      name: 'Test Restaurant',
      timezone: 'Asia/Kolkata',
    };

    const mockOffers = [
      {
        offer_id: 'offer-1',
        category_id: categoryId,
        type: OfferType.PERCENT,
        amount: 15,
        max_discount: 50,
        available_from: '10:00:00',
        available_to: '18:00:00',
      },
    ];

    it('successfully retrieves offers for a category', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(mockOffers as any);

      const result = await getOffersByCategory(categoryId, restaurantId);

      expect(MenuDbService.getRestaurantById).toHaveBeenCalledWith(
        restaurantId,
      );
      expect(OfferDbService.getOffersByCategory).toHaveBeenCalledWith(
        categoryId,
        '14:00:00', // Fixed time formatted
      );
      expect(result).toEqual(mockOffers);
      expect(result).toHaveLength(1);
    });

    it('throws AppError when restaurant is not found', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(null);

      await expect(
        getOffersByCategory(categoryId, restaurantId),
      ).rejects.toThrow(AppError);

      try {
        await getOffersByCategory(categoryId, restaurantId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.RESTAURANT_NOT_FOUND.key);
      }
    });

    it('throws AppError when no offers are found', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([]);

      await expect(
        getOffersByCategory(categoryId, restaurantId),
      ).rejects.toThrow(AppError);

      try {
        await getOffersByCategory(categoryId, restaurantId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).key).toBe(Errors.OFFER_NOT_FOUND.key);
      }
    });

    it('throws AppError when offers are null', async () => {
      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(mockRestaurant as any);

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(null as any);

      await expect(
        getOffersByCategory(categoryId, restaurantId),
      ).rejects.toThrow(AppError);
    });

    it('uses restaurant timezone for time calculation', async () => {
      const restaurantInDifferentTimezone = {
        ...mockRestaurant,
        timezone: 'Europe/London',
      };

      jest
        .spyOn(MenuDbService, 'getRestaurantById')
        .mockResolvedValue(restaurantInDifferentTimezone as any);

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(mockOffers as any);

      await getOffersByCategory(categoryId, restaurantId);

      // Time should be converted to Europe/London timezone
      const expectedTime = FIXED_TIME.setZone('Europe/London').toFormat(
        'HH:mm:ss',
      );
      expect(OfferDbService.getOffersByCategory).toHaveBeenCalledWith(
        categoryId,
        expectedTime,
      );
    });
  });
});
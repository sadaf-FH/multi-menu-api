jest.mock('../../models', () => ({
  sequelize: {},
  models: {},
}));

jest.mock('../../repositories/menu.repository', () => ({
  MenuRepository: {
    findByRestaurant: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../repositories/restaurant.repository', () => ({
  RestaurantRepository: {
    findById: jest.fn(),
  },
}));

jest.mock('../../services/db/menu.dbservice', () => ({
  MenuDbService: {
    getRestaurantById: jest.fn(),
    getMenuByRestaurant: jest.fn(),
  },
}));

jest.mock('../../services/db/offer.dbservice', () => ({
  OfferDbService: {
    getOffersByCategory: jest.fn(),
    getOffersByItem: jest.fn(),
  },
}));

import { getMenuWithTimeFilter } from '../../services/menu.service';
import { MenuDbService } from '../../services/db/menu.dbservice';
import { OfferDbService } from '../../services/db/offer.dbservice';
import { DateTime } from 'luxon';

// Helper function for testing
const isItemAvailableNow = (
  availableFrom: string | null,
  availableTo: string | null,
  currentTime: string,
): boolean => {
  if (!availableFrom && !availableTo) return true;
  if (!availableFrom || !availableTo) return false;
  if (availableFrom <= availableTo) {
    return currentTime >= availableFrom && currentTime <= availableTo;
  }
  return currentTime >= availableFrom || currentTime <= availableTo;
};

describe('getMenuWithTimeFilter', () => {
  const restaurantId = 'test-restaurant-id';
  let mockItem: any;
  let dateTimeSpy: jest.SpyInstance;

  // Fixed time for all tests: 2024-01-01 at 14:00:00 (2:00 PM) in Asia/Kolkata
  const FIXED_TIME_RAW = DateTime.fromISO('2024-01-01T14:00:00', {
    zone: 'Asia/Kolkata',
  });

  // Validate and assert the DateTime is valid
  if (!FIXED_TIME_RAW.isValid) {
    throw new Error('Invalid FIXED_TIME setup in tests');
  }

  const FIXED_TIME = FIXED_TIME_RAW as DateTime<true>;

  beforeEach(() => {
    jest.restoreAllMocks();

    // Mock DateTime.now() to return fixed time
    dateTimeSpy = jest.spyOn(DateTime, 'now').mockReturnValue(FIXED_TIME);

    mockItem = {
      item_id: 'item-1',
      available_from: '10:00:00',
      available_to: '18:00:00',
      ItemPrices: [
        {
          price: 100,
          dataValues: {},
        },
      ],
      dataValues: {},
    };

    jest.spyOn(MenuDbService, 'getRestaurantById').mockResolvedValue({
      R_ID: restaurantId,
      timezone: 'Asia/Kolkata',
    } as any);

    jest.spyOn(MenuDbService, 'getMenuByRestaurant').mockResolvedValue({
      menu_id: 'menu-1',
      Categories: [
        {
          category_id: 'cat-1',
          Items: [mockItem],
        },
      ],
    } as any);

    jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([]);
    jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);
  });

  afterEach(() => {
    dateTimeSpy.mockRestore();
  });

  it('marks item as available and applies pricing', async () => {
    // Current time: 14:00 (2:00 PM)
    // Item available: 10:00 - 18:00 (6:00 PM)
    // Expected: available (14:00 is within the window)

    (MenuDbService.getRestaurantById as jest.Mock).mockResolvedValue({
      R_ID: restaurantId,
      timezone: 'Asia/Kolkata',
    });

    (MenuDbService.getMenuByRestaurant as jest.Mock).mockResolvedValue({
      Categories: [
        {
          category_id: 'cat-1',
          Items: [
            {
              item_id: 'item-1',
              available_from: '10:00:00',
              available_to: '18:00:00',
              ItemPrices: [{ price: 100, dataValues: {} }],
              dataValues: {},
            },
          ],
        },
      ],
    });

    (OfferDbService.getOffersByCategory as jest.Mock).mockResolvedValue([]);
    (OfferDbService.getOffersByItem as jest.Mock).mockResolvedValue([]);

    const result = await getMenuWithTimeFilter(restaurantId);

    const item = result?.Categories?.[0]?.Items?.[0];

    expect(item).toBeDefined();
    expect(item?.dataValues.is_available_now).toBe(true);
    expect(item?.ItemPrices?.[0]?.dataValues.final_price).toBeDefined();
  });

  it('marks item as unavailable when outside availability window', async () => {
    // Current time: 14:00 (2:00 PM)
    // Item available: 08:00 - 12:00 (noon)
    // Expected: unavailable (14:00 is after the window)

    mockItem.available_from = '08:00:00';
    mockItem.available_to = '12:00:00';

    const result = await getMenuWithTimeFilter(restaurantId);

    const item = result?.Categories?.[0]?.Items?.[0];

    expect(item).toBeDefined();
    expect(item?.dataValues.is_available_now).toBe(false);
  });

  it('marks item as unavailable when before availability window', async () => {
    // Current time: 14:00 (2:00 PM)
    // Item available: 18:00 - 22:00 (6:00 PM - 10:00 PM)
    // Expected: unavailable (14:00 is before the window)

    mockItem.available_from = '18:00:00';
    mockItem.available_to = '22:00:00';

    const result = await getMenuWithTimeFilter(restaurantId);

    const item = result?.Categories?.[0]?.Items?.[0];

    expect(item).toBeDefined();
    expect(item?.dataValues.is_available_now).toBe(false);
  });

  it('marks item as available when no availability window is defined', async () => {
    // No time restrictions
    // Expected: always available

    mockItem.available_from = null;
    mockItem.available_to = null;

    const result = await getMenuWithTimeFilter(restaurantId);
    const item = result?.Categories?.[0]?.Items?.[0];

    expect(item).toBeDefined();
    expect(item?.dataValues.is_available_now).toBe(true);
  });

  it('applies category offer when item has no offers', async () => {
    // Current time: 14:00 (2:00 PM)
    // Item available: 10:00 - 18:00 (6:00 PM)
    // Expected: category offer applied since no item-level offers exist

    jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([
      { type: 'FLAT', amount: 30, max_discount: 30 },
    ] as any);
    jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

    const result = await getMenuWithTimeFilter(restaurantId);
    const price = result?.Categories?.[0]?.Items?.[0]?.ItemPrices?.[0];

    expect(price).toBeDefined();
    expect(price?.dataValues.discount).toBe(30);
    expect(price?.dataValues.final_price).toBe(70); // 100 - 30 = 70
  });

  it('prefers item-level offers over category offers', async () => {
    // Current time: 14:00 (2:00 PM)
    // Item available: 10:00 - 18:00 (6:00 PM)
    // Category offer: 10% off (max 50)
    // Item offer: 20% off (max 100)
    // Expected: item-level offer should be applied (20% of 100 = 20 discount)

    jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([
      { type: 'PERCENT', amount: 10, max_discount: 50 },
    ] as any);
    jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([
      { type: 'PERCENT', amount: 20, max_discount: 100 },
    ] as any);

    const result = await getMenuWithTimeFilter(restaurantId);
    const price = result?.Categories?.[0]?.Items?.[0]?.ItemPrices?.[0];

    expect(price).toBeDefined();
    expect(price?.dataValues.discount).toBe(20); // 20% of 100
    expect(price?.dataValues.final_price).toBe(80); // 100 - 20 = 80
    expect(price?.dataValues.applied_offer).toBeDefined();
  });
});

describe('isItemAvailableNow', () => {
  it('returns true when no availability window is defined', () => {
    expect(isItemAvailableNow(null, null, '12:00:00')).toBe(true);
  });

  it('returns false when only one boundary is defined', () => {
    expect(isItemAvailableNow('10:00:00', null, '12:00:00')).toBe(false);
    expect(isItemAvailableNow(null, '18:00:00', '12:00:00')).toBe(false);
  });

  it('returns true when current time is inside same-day window', () => {
    expect(isItemAvailableNow('10:00:00', '18:00:00', '12:00:00')).toBe(true);
  });

  it('returns false when current time is outside same-day window', () => {
    expect(isItemAvailableNow('10:00:00', '18:00:00', '19:00:00')).toBe(false);
  });

  it('handles overnight window correctly (e.g. 22:00 → 06:00)', () => {
    expect(isItemAvailableNow('22:00:00', '06:00:00', '23:00:00')).toBe(true);
    expect(isItemAvailableNow('22:00:00', '06:00:00', '05:00:00')).toBe(true);
    expect(isItemAvailableNow('22:00:00', '06:00:00', '12:00:00')).toBe(false);
  });
});
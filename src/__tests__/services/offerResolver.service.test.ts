jest.mock('../../services/db/offer.dbservice', () => ({
  OfferDbService: {
    getOffersByCategory: jest.fn(),
    getOffersByItem: jest.fn(),
  },
}));

import { enrichItemPricesWithOffers } from '../../services/offerResolver.service';
import { OfferDbService } from '../../services/db/offer.dbservice';
import { OfferType } from '../../utils/constants';

type PriceDataValues = {
  base_price?: number;
  discount?: number;
  final_price?: number;
  applied_offer?: any;
};

type ItemPrice = {
  price: number;
  dataValues: PriceDataValues;
};

type Item = {
  item_id: string;
  ItemPrices?: ItemPrice[];
};

type Category = {
  category_id: string;
  Items?: Item[];
};

describe('enrichItemPricesWithOffers', () => {
  const currentTime = '14:00:00';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('enriches item prices with category offers when no item offers exist', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 30,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [
              {
                price: 100,
                dataValues: {},
              },
            ],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByCategory).toHaveBeenCalledWith(
        'cat-1',
        currentTime,
      );
      expect(OfferDbService.getOffersByItem).toHaveBeenCalledWith(
        'item-1',
        currentTime,
      );

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.base_price).toBe(100);
      expect(price.dataValues.discount).toBe(30);
      expect(price.dataValues.final_price).toBe(70);
      expect(price.dataValues.applied_offer).toEqual(categoryOffers[0]);
    });

    it('enriches item prices with item offers when they exist', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const itemOffers = [
        {
          offer_id: 'item-offer-1',
          type: OfferType.PERCENT,
          amount: 25,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [
              {
                price: 100,
                dataValues: {},
              },
            ],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(itemOffers as any);

      await enrichItemPricesWithOffers(category, currentTime);

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.base_price).toBe(100);
      expect(price.dataValues.discount).toBe(25); // Item offer takes precedence
      expect(price.dataValues.final_price).toBe(75);
      expect(price.dataValues.applied_offer).toEqual(itemOffers[0]);
    });

    it('handles multiple items in a category', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 15,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 100, dataValues: {} }],
          },
          {
            item_id: 'item-2',
            ItemPrices: [{ price: 200, dataValues: {} }],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByItem).toHaveBeenCalledTimes(2);
      expect(category.Items![0].ItemPrices![0].dataValues.final_price).toBe(85);
      expect(category.Items![1].ItemPrices![0].dataValues.final_price).toBe(185);
    });

    it('handles multiple prices for a single item', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.PERCENT,
          amount: 10,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [
              { price: 100, dataValues: {} },
              { price: 150, dataValues: {} },
              { price: 200, dataValues: {} },
            ],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(category.Items![0].ItemPrices![0].dataValues.final_price).toBe(90);
      expect(category.Items![0].ItemPrices![1].dataValues.final_price).toBe(135);
      expect(category.Items![0].ItemPrices![2].dataValues.final_price).toBe(180);
    });
  });

  describe('edge cases', () => {
    it('handles category with no items', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByCategory).toHaveBeenCalledWith(
        'cat-1',
        currentTime,
      );
      expect(OfferDbService.getOffersByItem).not.toHaveBeenCalled();
    });

    it('handles category with undefined Items', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByCategory).toHaveBeenCalled();
      expect(OfferDbService.getOffersByItem).not.toHaveBeenCalled();
    });

    it('handles item with no prices', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByItem).toHaveBeenCalledWith(
        'item-1',
        currentTime,
      );
    });

    it('handles item with undefined ItemPrices', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByItem).toHaveBeenCalled();
    });

    it('handles when no category offers exist', async () => {
      const itemOffers = [
        {
          offer_id: 'item-offer-1',
          type: OfferType.PERCENT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 100, dataValues: {} }],
          },
        ],
      };

      jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([]);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(itemOffers as any);

      await enrichItemPricesWithOffers(category, currentTime);

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.discount).toBe(20);
      expect(price.dataValues.final_price).toBe(80);
    });

    it('handles when no offers exist at all', async () => {
      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 100, dataValues: {} }],
          },
        ],
      };

      jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([]);
      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.base_price).toBe(100);
      expect(price.dataValues.discount).toBe(0);
      expect(price.dataValues.final_price).toBe(100);
      expect(price.dataValues.applied_offer).toBeNull();
    });
  });

  describe('offer prioritization', () => {
    it('prefers item-level offers over category-level offers', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 50,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const itemOffers = [
        {
          offer_id: 'item-offer-1',
          type: OfferType.PERCENT,
          amount: 10,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 100, dataValues: {} }],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(itemOffers as any);

      await enrichItemPricesWithOffers(category, currentTime);

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.discount).toBe(10); // Item offer applied
      expect(price.dataValues.applied_offer?.offer_id).toBe('item-offer-1');
    });

    it('uses category offers when item has no offers', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.PERCENT,
          amount: 15,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 200, dataValues: {} }],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.discount).toBe(30); // 15% of 200
      expect(price.dataValues.applied_offer?.offer_id).toBe('cat-offer-1');
    });

    it('applies best offer from multiple item offers', async () => {
      const itemOffers = [
        {
          offer_id: 'item-offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          offer_id: 'item-offer-2',
          type: OfferType.PERCENT,
          amount: 30,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 100, dataValues: {} }],
          },
        ],
      };

      jest.spyOn(OfferDbService, 'getOffersByCategory').mockResolvedValue([]);

      jest
        .spyOn(OfferDbService, 'getOffersByItem')
        .mockResolvedValue(itemOffers as any);

      await enrichItemPricesWithOffers(category, currentTime);

      const price = category.Items![0].ItemPrices![0];
      expect(price.dataValues.discount).toBe(30); // 30% is better than flat 20
      expect(price.dataValues.applied_offer?.offer_id).toBe('item-offer-2');
    });
  });

  describe('concurrent processing', () => {
    it('processes multiple items concurrently', async () => {
      const categoryOffers = [
        {
          offer_id: 'cat-offer-1',
          type: OfferType.FLAT,
          amount: 10,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const category: Category = {
        category_id: 'cat-1',
        Items: [
          {
            item_id: 'item-1',
            ItemPrices: [{ price: 100, dataValues: {} }],
          },
          {
            item_id: 'item-2',
            ItemPrices: [{ price: 150, dataValues: {} }],
          },
          {
            item_id: 'item-3',
            ItemPrices: [{ price: 200, dataValues: {} }],
          },
        ],
      };

      jest
        .spyOn(OfferDbService, 'getOffersByCategory')
        .mockResolvedValue(categoryOffers as any);

      jest.spyOn(OfferDbService, 'getOffersByItem').mockResolvedValue([]);

      await enrichItemPricesWithOffers(category, currentTime);

      expect(OfferDbService.getOffersByItem).toHaveBeenCalledTimes(3);
      expect(category.Items![0].ItemPrices![0].dataValues.final_price).toBe(90);
      expect(category.Items![1].ItemPrices![0].dataValues.final_price).toBe(140);
      expect(category.Items![2].ItemPrices![0].dataValues.final_price).toBe(190);
    });
  });
});
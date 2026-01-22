import { applyBestOffer } from '../../services/pricing.service';
import { OfferType } from '../../utils/constants';

describe('applyBestOffer', () => {
  describe('when no offers are provided', () => {
    it('returns original price with no discount when offers array is empty', () => {
      const result = applyBestOffer(100, []);

      expect(result).toEqual({
        finalPrice: 100,
        discount: 0,
        appliedOffer: null,
      });
    });

    it('returns original price with no discount when offers is null', () => {
      const result = applyBestOffer(100, null as any);

      expect(result).toEqual({
        finalPrice: 100,
        discount: 0,
        appliedOffer: null,
      });
    });

    it('returns original price with no discount when offers is undefined', () => {
      const result = applyBestOffer(100, undefined as any);

      expect(result).toEqual({
        finalPrice: 100,
        discount: 0,
        appliedOffer: null,
      });
    });
  });

  describe('flat discount offers', () => {
    it('applies a single flat discount offer correctly', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.FLAT,
          amount: 30,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(70);
      expect(result.discount).toBe(30);
      expect(result.appliedOffer).toEqual(offers[0]);
    });

    it('selects the best flat discount from multiple offers', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.FLAT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-2',
          type: OfferType.FLAT,
          amount: 50,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-3',
          type: OfferType.FLAT,
          amount: 35,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(50);
      expect(result.discount).toBe(50);
      expect(result.appliedOffer?.id).toBe('offer-2');
    });

    it('does not allow negative final price with flat discount', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.FLAT,
          amount: 150,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(0);
      expect(result.discount).toBe(150);
    });
  });

  describe('percentage discount offers', () => {
    it('applies a single percentage discount offer correctly', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 20,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(80);
      expect(result.discount).toBe(20);
      expect(result.appliedOffer).toEqual(offers[0]);
    });

    it('applies percentage discount with max_discount cap', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 50, // 50% of 1000 = 500
          max_discount: 100,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(1000, offers as any);

      expect(result.finalPrice).toBe(900); // 1000 - 100
      expect(result.discount).toBe(100); // Capped at max_discount
      expect(result.appliedOffer).toEqual(offers[0]);
    });

    it('applies full percentage discount when below max_discount', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 10, // 10% of 100 = 10
          max_discount: 50,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(90);
      expect(result.discount).toBe(10); // Not capped
    });

    it('selects the best percentage discount from multiple offers', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 10,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-2',
          type: OfferType.PERCENT,
          amount: 25,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-3',
          type: OfferType.PERCENT,
          amount: 15,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(200, offers as any);

      expect(result.finalPrice).toBe(150); // 200 - 50
      expect(result.discount).toBe(50); // 25% of 200
      expect(result.appliedOffer?.id).toBe('offer-2');
    });

    it('handles 100% discount correctly', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 100,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(0);
      expect(result.discount).toBe(100);
    });
  });

  describe('mixed offer types', () => {
    it('selects the best offer between flat and percentage discounts', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.FLAT,
          amount: 30,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-2',
          type: OfferType.PERCENT,
          amount: 20, // 20% of 200 = 40
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(200, offers as any);

      expect(result.finalPrice).toBe(160);
      expect(result.discount).toBe(40);
      expect(result.appliedOffer?.id).toBe('offer-2');
      expect(result.appliedOffer?.type).toBe(OfferType.PERCENT);
    });

    it('prefers flat discount when it is better than percentage', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 10, // 10% of 100 = 10
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-2',
          type: OfferType.FLAT,
          amount: 25,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.finalPrice).toBe(75);
      expect(result.discount).toBe(25);
      expect(result.appliedOffer?.id).toBe('offer-2');
      expect(result.appliedOffer?.type).toBe(OfferType.FLAT);
    });

    it('considers max_discount when comparing mixed offers', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 50, // 50% of 500 = 250, but capped at 100
          max_discount: 100,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-2',
          type: OfferType.FLAT,
          amount: 150,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(500, offers as any);

      expect(result.finalPrice).toBe(350); // 500 - 150
      expect(result.discount).toBe(150);
      expect(result.appliedOffer?.id).toBe('offer-2');
    });
  });

  describe('edge cases', () => {
    it('handles zero price correctly', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 50,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(0, offers as any);

      expect(result.finalPrice).toBe(0);
      expect(result.discount).toBe(0);
    });

    it('handles very small prices correctly', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 10,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(5, offers as any);

      expect(result.finalPrice).toBe(4.5);
      expect(result.discount).toBe(0.5);
    });

    it('handles very large prices correctly', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.PERCENT,
          amount: 15,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(10000, offers as any);

      expect(result.finalPrice).toBe(8500);
      expect(result.discount).toBe(1500);
    });

    it('returns first offer when multiple offers have same discount', () => {
      const offers = [
        {
          id: 'offer-1',
          type: OfferType.FLAT,
          amount: 50,
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
        {
          id: 'offer-2',
          type: OfferType.PERCENT,
          amount: 50, // 50% of 100 = 50
          available_from: '10:00:00',
          available_to: '18:00:00',
        },
      ];

      const result = applyBestOffer(100, offers as any);

      expect(result.discount).toBe(50);
      expect(result.appliedOffer?.id).toBe('offer-1'); 
    });
  });
});
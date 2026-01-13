import { DateTime } from 'luxon';
import { OfferRepository } from '../../repositories/offer.repository';
import { OfferType } from '../../utils/constants';
import { MenuDbService } from './menu.dbservice';

export const OfferDbService = {
  async createOffer(data: {
    item_id?: string | null;
    category_id?: string | null;
    type: string;
    amount: number;
    max_discount?: number;
  }) {
    return OfferRepository.create({
      item_id: data.item_id ?? null,
      category_id: data.category_id ?? null,
      type: data.type as OfferType,
      amount: data.amount,
      max_discount: data.max_discount ?? undefined,
    });
  },

  async getOffersByItem(itemId: string) {
    const [{ timezone }] = await MenuDbService.getTimezoneForItem(itemId);

    const time = DateTime.now().setZone(timezone).toFormat('HH:mm:ss');

    return OfferRepository.findByItemId(itemId, time);
  },

  async getOffersByCategory(categoryId: string) {
    return OfferRepository.findByCategoryId(categoryId);
  },
};

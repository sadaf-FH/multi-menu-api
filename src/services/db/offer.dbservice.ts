import { OfferRepository } from '../../repositories/offer.repository';

export const OfferDbService = {
  createOffer(data: any) {
    return OfferRepository.create(data);
  },

  getOffersByItem(itemId: string, time: string) {
    return OfferRepository.findByItemId(itemId, time);
  },

  getOffersByCategory(categoryId: string, time: string) {
    return OfferRepository.findByCategoryId(categoryId, time);
  },
};

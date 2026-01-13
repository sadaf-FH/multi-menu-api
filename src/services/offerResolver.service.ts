import { OfferDbService } from './db/offer.dbservice';
import { applyBestOffer } from './pricing.service';

export const enrichItemPricesWithOffers = async (category: any) => {
  const categoryOffers = await OfferDbService.getOffersByCategory(category.category_id);

  for (const item of category.Items) {
    const itemOffers = await OfferDbService.getOffersByItem(item.item_id);

    for (const price of item.ItemPrices) {
      const applicableOffers = itemOffers.length > 0 ? itemOffers : categoryOffers;

      const { finalPrice, discount, appliedOffer } = applyBestOffer(price.price, applicableOffers);

      price.dataValues.base_price = price.price;
      price.dataValues.discount = discount;
      price.dataValues.final_price = finalPrice;
      price.dataValues.applied_offer = appliedOffer;
    }
  }
};

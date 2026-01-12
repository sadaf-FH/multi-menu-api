import { Offer } from "../models/Offer";

export function applyBestOffer(price: number, offers: Offer[]) {
  if (!offers || offers.length === 0) {
    return { finalPrice: price, discount: 0, appliedOffer: null };
  }

  let bestDiscount = 0;
  let bestOffer: Offer | null = null;

  for (const offer of offers) {
    let discount = 0;

    if (offer.type === "FLAT") {
      discount = offer.amount;
    } else {
      discount = (price * offer.amount) / 100;
      if (offer.max_discount) {
        discount = Math.min(discount, offer.max_discount);
      }
    }

    if (discount > bestDiscount) {
      bestDiscount = discount;
      bestOffer = offer;
    }
  }

  return {
    finalPrice: Math.max(price - bestDiscount, 0),
    discount: bestDiscount,
    appliedOffer: bestOffer,
  };
}

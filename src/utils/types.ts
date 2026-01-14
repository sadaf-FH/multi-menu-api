import { OfferType } from './constants';

export type CreateRestaurantInput = {
  name: string;
  franchise?: string;
  location: string;
  timezone: string;
  available?: boolean;
};

export type CreateOfferInput = {
  item_id?: string;
  category_id?: string;
  type: OfferType;
  amount: number;
  max_discount: number;
};

export type ItemTimezoneRow = {
  timezone: string;
};

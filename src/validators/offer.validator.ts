import { z } from 'zod';
import { OfferType } from '../utils/constants';

export const createOfferSchema = z
  .object({
    item_id: z.string().uuid().optional(),
    category_id: z.string().uuid().optional(),
    type: z.nativeEnum(OfferType),
    amount: z.number().positive(),
    max_discount: z.number().positive(),
  })
  .refine((data) => data.item_id || data.category_id, {
    message: 'Offer must be linked to item or category',
  });

export const offerParamSchema = z.object({
  id: z.string().uuid(),
});

export const offerQuerySchema = z.object({
  price: z.string().regex(/^\d+(\.\d+)?$/),
});

import { z } from "zod";
import { OrderType } from "../utils/constants";

const timeSchema = z.object({
  available_from: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  available_to: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
});

const priceSchema = z.object({
  order_type: z.nativeEnum(OrderType),
  price: z.number().positive(),
});

const itemSchema = z.object({
  time: timeSchema.optional(),
  prices: z.array(priceSchema).min(1),
  addons: z
    .object({
      min_quantity: z.number().min(0),
      max_quantity: z.number().min(0),
      required: z.boolean(),
    })
    .optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  avg_price: z.number().positive(),
  items: z.array(itemSchema).min(1),
});

export const createMenuSchema = z.object({
  restaurantId: z.string().uuid(),
  version: z.number().int().positive(),
  categories: z.array(categorySchema).min(1),
});

export const getMenuByRestaurantParamsSchema = z.object({
  id: z.string().uuid(),
});

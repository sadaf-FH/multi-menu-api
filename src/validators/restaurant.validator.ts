import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1),
  franchise: z.string().nullable().optional(),
  location: z.string().min(1),
  available: z.boolean().optional(),
  timezone: z.string().default('UTC'),
});

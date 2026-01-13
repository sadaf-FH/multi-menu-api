import { Router } from 'express';
import { createMenu, getMenuByRestaurant } from '../controllers/menu.controller';
import { validate } from '../middlewares/validate.middleware';
import { createMenuSchema, getMenuByRestaurantParamsSchema } from '../validators/menu.validator';

const router = Router();

router.post('/', validate(createMenuSchema), createMenu);

router.get(
  '/restaurant/:id',
  validate(getMenuByRestaurantParamsSchema, 'params'),
  getMenuByRestaurant,
);

export default router;

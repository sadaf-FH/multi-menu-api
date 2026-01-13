import { Router } from 'express';
import { createRestaurant } from '../controllers/restaurant.controller';
import { validate } from '../middlewares/validate.middleware';
import { createRestaurantSchema } from '../validators/restaurant.validator';

const router = Router();

router.post('/', validate(createRestaurantSchema), createRestaurant);

export default router;

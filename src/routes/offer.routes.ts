import { Router } from 'express';
import {
  createOfferController,
  getOffersByItemController,
  getOffersByCategoryController,
} from '../controllers/offer.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  createOfferSchema,
  offerParamSchema,
  offerQuerySchema,
} from '../validators/offer.validator';

const router = Router();

router.post('/', validate(createOfferSchema), createOfferController);

router.get('/item/:id', validate(offerParamSchema, 'params'), getOffersByItemController);

router.get('/category/:id', validate(offerParamSchema, 'params'), getOffersByCategoryController);

export default router;

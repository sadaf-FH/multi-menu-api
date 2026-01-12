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

router.post('/offers', validate(createOfferSchema), createOfferController);

router.get(
  '/offers/item/:id',
  validate(offerParamSchema, 'params'),
  validate(offerQuerySchema, 'query'),
  getOffersByItemController,
);

router.get(
  '/offers/category/:id',
  validate(offerParamSchema, 'params'),
  validate(offerQuerySchema, 'query'),
  getOffersByCategoryController,
);

export default router;

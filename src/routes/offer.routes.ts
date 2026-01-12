import { Router } from "express";
import {
  createOfferController,
  getOffersByItemController,
  getOffersByCategoryController,
} from "../controllers/offer.controller";

const router = Router();

router.post("/offers", createOfferController);

router.get("/offers/item/:id", getOffersByItemController);

router.get("/offers/category/:id", getOffersByCategoryController);

export default router;

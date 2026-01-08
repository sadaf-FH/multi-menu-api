import { Router } from "express";
import {
  createOffer,
  getOffersByCategory,
  getOffersByItem,
} from "../controllers/offer.controller";

const router = Router();

router.post("/", createOffer);
router.get("/category/:categoryId", getOffersByCategory);
router.get("/item/:itemId", getOffersByItem);

export default router;

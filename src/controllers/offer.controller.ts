import { Request, Response } from "express";
import {
  createOffer,
  getOffersByItem,
  getOffersByCategory,
} from "../services/offer.service";
import { ERRORS, RESPONSE_CODES } from "../utils/constants";

export const createOfferController = async (req: Request, res: Response) => {
  try {
    const { item_id, category_id, type, amount, max_discount } = req.body;

    const offer = await createOffer({
      item_id,
      category_id,
      type,
      amount,
      max_discount,
    });

    res.status(RESPONSE_CODES.CREATED).json({ success: true, offer });
  } catch (err: any) {
    res.status(RESPONSE_CODES.NOT_FOUND_ERROR).json({ success: false, message: err.message });
  }
};

export const getOffersByItemController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemPrice = parseFloat(req.query.price as string);
    if (isNaN(itemPrice)) {
      return res.status(RESPONSE_CODES.NOT_FOUND_ERROR).json({ success: false, message: ERRORS.PRICE_QUERY_PARAM_NOT_FOUND });
    }

    const offers = await getOffersByItem(id, itemPrice);
    res.json({ success: true, offers });
  } catch (err: any) {
    res.status(RESPONSE_CODES.NOT_FOUND_ERROR).json({ success: false, message: err.message });
  }
};

export const getOffersByCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const itemPrice = parseFloat(req.query.price as string);
    if (isNaN(itemPrice)) {
      return res.status(RESPONSE_CODES.NOT_FOUND_ERROR).json({ success: false, message: ERRORS.PRICE_QUERY_PARAM_NOT_FOUND });
    }

    const offers = await getOffersByCategory(id, itemPrice);
    res.json({ success: true, offers });
  } catch (err: any) {
    res.status(RESPONSE_CODES.NOT_FOUND_ERROR).json({ success: false, message: err.message });
  }
};

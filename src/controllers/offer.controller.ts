import { Request, Response } from "express";
import * as OfferService from "../services/offer.service";
import { ERROR_CODES, RESPONSE_CODES } from "../utils/constants";

export const createOfferController = async (req: Request, res: Response) => {
  try {
    const offer = await OfferService.createOffer(req.body);
    res.status(RESPONSE_CODES.CREATED).json(offer);
  } catch (err: any) {
    res.status(ERROR_CODES.BAD_REQUEST).json({ message: err.message });
  }
};

export const getOffersByItemController = async (
  req: Request,
  res: Response
) => {
  try {
    const offers = await OfferService.getOffersByItem(req.params.id);
    res.json(offers);
  } catch (err: any) {
    res.status(ERROR_CODES.BAD_REQUEST).json({ message: err.message });
  }
};

export const getOffersByCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const offers = await OfferService.getOffersByCategory(req.params.id);
    res.json(offers);
  } catch (err: any) {
    res.status(ERROR_CODES.BAD_REQUEST).json({ message: err.message });
  }
};

import { Request, Response } from "express";
import * as offerService from "../services/offer.service";

export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create offer" });
  }
};

export const getOffersByCategory = async (req: Request, res: Response) => {
  try {
    const offers = await offerService.getOffersByCategory(
      req.params.categoryId
    );
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category offers" });
  }
};

export const getOffersByItem = async (req: Request, res: Response) => {
  try {
    const offers = await offerService.getOffersByItem(req.params.itemId);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item offers" });
  }
};

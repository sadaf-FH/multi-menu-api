import { Request, Response } from "express";
import * as restaurantService from "../services/restaurant.service";
import { ERRORS, RESPONSE_CODES } from "../utils/constants";

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await restaurantService.createRestaurant(req.body);
    res.status(RESPONSE_CODES.CREATED).json(restaurant);
  } catch (err) {
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({ error: ERRORS.RESTAURANT_CREATION_FAILURE });
  }
};
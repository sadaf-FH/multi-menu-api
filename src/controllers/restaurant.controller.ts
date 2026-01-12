import { Request, Response } from "express";
import * as restaurantService from "../services/restaurant.service";
import { ERROR_CODES, ERRORS, RESPONSE_CODES } from "../utils/constants";

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await restaurantService.createRestaurant(req.body);
    res.status(RESPONSE_CODES.CREATED).json(restaurant);
  } catch (err) {
    res.status(ERROR_CODES.INTERNAL_SERVER).json({ error: ERRORS.RESTAURANT_CREATION_FAILURE });
  }
};
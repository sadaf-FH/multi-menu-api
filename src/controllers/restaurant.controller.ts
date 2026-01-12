import { Request, Response } from "express";
import * as RestaurantService from "../services/restaurant.service";
import { ERROR_CODES, RESPONSE_CODES } from "../utils/constants";

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await RestaurantService.createRestaurant(req.body);
    res.status(RESPONSE_CODES.CREATED).json(restaurant);
  } catch (err: any) {
    res.status(ERROR_CODES.BAD_REQUEST).json({ message: err.message });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await RestaurantService.getRestaurantById(req.params.id);
    res.json(restaurant);
  } catch (err: any) {
    res.status(ERROR_CODES.NOT_FOUND).json({ message: err.message });
  }
};

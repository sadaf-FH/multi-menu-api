import { Request, Response } from "express";
import * as restaurantService from "../services/restaurant.service";

export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await restaurantService.createRestaurant(req.body);
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: "Failed to create restaurant" });
  }
};
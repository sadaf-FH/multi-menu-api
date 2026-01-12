import { Request, Response } from "express";
import * as menuService from "../services/menu.service";

export const createMenu = async (req: Request, res: Response) => {
  try {
    const result = await menuService.createMenu(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create menu" });
  }
};

export const getMenuByRestaurant = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.getMenuByRestaurant(req.params.id);
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
};

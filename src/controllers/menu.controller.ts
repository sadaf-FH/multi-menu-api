import { Request, Response } from "express";
import * as MenuService from "../services/menu.service";
import { RESPONSE_CODES } from "../utils/constants";

export const createMenu = async (req: Request, res: Response) => {
  const menu = await MenuService.createMenu(req.body);
  res.status(RESPONSE_CODES.CREATED).json(menu);
};

export const getMenuByRestaurant = async (req: Request, res: Response) => {
  const menu = await MenuService.getMenuWithTimeFilter(req.params.id);
  res.json(menu);
};

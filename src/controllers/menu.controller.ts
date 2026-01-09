import { Request, Response } from "express";
import * as menuService from "../services/menu.service";
import { ERRORS, RESPONSE_CODES } from "../utils/constants";

export const createMenu = async (req: Request, res: Response) => {
  try {
    const result = await menuService.createMenu(req.body);
    res.status(RESPONSE_CODES.CREATED).json(result);
  } catch (error) {
    console.error(error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({ error: ERRORS.MENU_CREATION_FAILURE });
  }
};

export const getMenuByRestaurant = async (req: Request, res: Response) => {
  try {
    const menu = await menuService.getMenuByRestaurantWithTimeFilter(
      req.params.id
    );
    res.json(menu);
  } catch (err) {
    console.log(err)
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({ error: ERRORS.MENU_FETCHING_FAILURE });
  }
};


import { Request, Response } from 'express';
import * as MenuService from '../services/menu.service';
import { RESPONSE_CODES } from '../utils/constants';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';
import { Success } from '../utils/success.catalog';

export const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const menu = await MenuService.createMenu(req.body);

  return res
    .status(Success.MENU_CREATED.code)
    .json(
      new ApiResponseBuilder<typeof menu>()
        .success(Success.MENU_CREATED.message)
        .withData(menu)
        .withCode(RESPONSE_CODES.CREATED)
        .build(),
    );
});

export const getMenuByRestaurant = asyncHandler(async (req: Request, res: Response) => {
  const menu = await MenuService.getMenuWithTimeFilter(req.params.id);

  if (!menu) {
    throw new AppError(Errors.MENU_NOT_FOUND);
  }

  return res.json(
    new ApiResponseBuilder<typeof menu>()
      .success(Success.MENU_FETCHED.message)
      .withData(menu)
      .withCode(Success.MENU_FETCHED.code)
      .build(),
  );
});

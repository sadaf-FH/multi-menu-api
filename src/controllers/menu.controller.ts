import { Request, Response } from 'express';
import * as MenuService from '../services/menu.service';
import { RESPONSE_CODES } from '../utils/constants';
import { ApiResponseBuilder } from '../utils/apiResponse';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { AppError } from '../errors/AppError';
import { Errors } from '../errors/error.catalog';

export const createMenu = asyncHandler(async (req: Request, res: Response) => {
  const menu = await MenuService.createMenu(req.body);

  return res
    .status(RESPONSE_CODES.CREATED)
    .json(
      new ApiResponseBuilder<typeof menu>()
        .success('Menu created successfully')
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
      .success('Menu fetched successfully')
      .withData(menu)
      .withCode(RESPONSE_CODES.OK)
      .build(),
  );
});

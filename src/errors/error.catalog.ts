import { AppErrorShape } from './error.types';

export const Errors = {
  MENU_CREATION_FAILURE: {
    key: 'MENU_CREATION_FAILURE',
    code: 400,
    message: 'Failed to create menu',
  },

  MENU_FETCHING_FAILURE: {
    key: 'MENU_FETCHING_FAILURE',
    code: 400,
    message: 'Failed to fetch menu',
  },

  VALIDATION_ERROR: {
    key: 'VALIDATION_ERROR',
    code: 400,
    message: 'Bad Request Error',
  },

  OFFER_NOT_FOUND: {
    key: 'OFFER_NOT_FOUND',
    code: 404,
    message: 'Offer Not Found',
  },

  MENU_NOT_FOUND: {
    key: 'MENU_NOT_FOUND',
    code: 404,
    message: 'Menu not found',
  },

  RESTAURANT_CREATION_FAILURE: {
    key: 'RESTAURANT_CREATION_FAILURE',
    code: 400,
    message: 'Failed to create restaurant',
  },

  RESTAURANT_NOT_FOUND: {
    key: 'RESTAURANT_NOT_FOUND',
    code: 404,
    message: 'Restaurant not found',
  },

  ITEM_OR_CATEGORY_REQUIRED: {
    key: 'ITEM_OR_CATEGORY_REQUIRED',
    code: 400,
    message: 'Offer must be linked to item or category',
  },

  ITEM_NOT_FOUND: {
    key: 'ITEM_NOT_FOUND',
    code: 404,
    message: 'Item not found',
  },

  CATEGORY_NOT_FOUND: {
    key: 'CATEGORY_NOT_FOUND',
    code: 404,
    message: 'Category not found',
  },

  INVALID_OFFER_TYPE: {
    key: 'INVALID_OFFER_TYPE',
    code: 400,
    message: 'Invalid offer type',
  },

  PRICE_QUERY_PARAM_NOT_FOUND: {
    key: 'PRICE_QUERY_PARAM_NOT_FOUND',
    code: 400,
    message: 'Price query param required',
  },

  OFFER_LINKING_ERROR: {
    key: 'OFFER_LINKING_ERROR',
    code: 400,
    message: 'Offer must be linked to an item or a category',
  },
  INTERNAL_SERVER_ERROR: {
    key: 'INTERNAL_SERVER_ERROR',
    code: 400,
    message: 'Internal Server Error',
  },
} as const satisfies Record<string, AppErrorShape>;

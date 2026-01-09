export enum OfferType {
  FLAT = "FLAT",
  PERCENT = "PERCENT",
}

export enum OrderType {
  DINE_IN = "DINE_IN",
  TAKEAWAY = "TAKEAWAY",
}

export const ERRORS = {
  MENU_CREATION_FAILURE: "Failed to create menu",
  MENU_FETCHING_FAILURE: "Failed to fetch menu",
  RESTAURANT_CREATION_FAILURE: "Failed to create restaurant",
  RESTAURANT_NOT_FOUND: "Restaurant not found",
  ITEM_OR_CATEGORY_REQUIRED: "Offer must be linked to item or category",
  ITEM_NOT_FOUND: "Item not found",
  INVALID_OFFER_TYPE: "Invalid offer type",
  MENU_NOT_FOUND: "Menu not found",
  CATEGORY_NOT_FOUND: "Category not found",
  PRICE_QUERY_PARAM_NOT_FOUND: "Price query param required",
  OFFER_LINKING_ERROR: "Offer must be linked to an item or a category"
};

export const RESPONSE_CODES = {
    OK: 200, 
    CREATED: 201, 
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND_ERROR: 400
};



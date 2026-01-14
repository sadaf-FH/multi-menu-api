import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Restaurant API
export const createRestaurant = async (data) => {
  const response = await api.post('/restaurants', data);
  return response.data;
};

// Menu API
export const createMenu = async (data) => {
  const response = await api.post('/menus', data);
  return response.data;
};

export const getMenuByRestaurant = async (restaurantId) => {
  const response = await api.get(`/menus/restaurant/${restaurantId}`);
  return response.data;
};

// Offer API
export const createOffer = async (data) => {
  const response = await api.post('/offers', data);
  return response.data;
};

export const getOffersByItem = async (itemId) => {
  const response = await api.get(`/offers/item/${itemId}`);
  return response.data;
};

export const getOffersByCategory = async (categoryId) => {
  const response = await api.get(`/offers/category/${categoryId}`);
  return response.data;
};

export default api;

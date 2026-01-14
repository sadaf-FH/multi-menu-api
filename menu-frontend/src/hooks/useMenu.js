import { useState, useEffect } from 'react';
import { getMenuByRestaurant } from '../services/api';

export const useMenu = (restaurantId) => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await getMenuByRestaurant(restaurantId);
        setMenu(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setMenu(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  return { menu, loading, error, refetch: () => getMenuByRestaurant(restaurantId).then(res => setMenu(res.data)) };
};

import { useState, useEffect } from 'react';
import { Search, Store } from 'lucide-react';

const RestaurantSelector = ({ onSelect }) => {
  const [restaurantId, setRestaurantId] = useState('');
  const [storedRestaurants, setStoredRestaurants] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('restaurants');
    if (stored) {
      setStoredRestaurants(JSON.parse(stored));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (restaurantId.trim()) {
      onSelect(restaurantId.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Menu Viewer
          </h1>
          <p className="text-gray-600">
            Select a restaurant to view their menu
          </p>
        </div>

        {storedRestaurants.length > 0 && (
          <div className="mb-6 bg-white rounded-xl p-4 border-2 border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3 text-sm">Your Restaurants</h2>
            <div className="space-y-2">
              {storedRestaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => onSelect(restaurant.id)}
                  className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-red-600 transition-colors truncate">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{restaurant.location}</div>
                    </div>
                    <div className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Or enter Restaurant ID"
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSelector;

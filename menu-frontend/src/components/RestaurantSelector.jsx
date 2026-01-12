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
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rust to-olive rounded-3xl mb-6 shadow-lg">
            <Store className="w-10 h-10 text-cream" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-charcoal mb-4">
            Menu Explorer
          </h1>
          <p className="text-xl text-charcoal/60 font-medium">
            Select a restaurant to view their menu
          </p>
        </div>

        {/* Stored Restaurants */}
        {storedRestaurants.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-sand/50">
            <h2 className="font-display font-bold text-charcoal mb-4 text-lg">
              Your Restaurants
            </h2>
            <div className="space-y-2">
              {storedRestaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => onSelect(restaurant.id)}
                  className="w-full text-left p-4 rounded-xl border-2 border-sand hover:border-rust hover:bg-rust/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-charcoal group-hover:text-rust transition-colors">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-charcoal/60">{restaurant.location}</div>
                    </div>
                    <div className="text-rust opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Entry */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Or enter Restaurant ID manually"
              className="w-full px-6 py-5 pr-14 text-lg rounded-2xl border-2 border-sand focus:border-rust focus:outline-none focus:ring-4 focus:ring-rust/20 transition-all bg-white shadow-lg font-medium placeholder:text-charcoal/30"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-rust to-olive text-cream p-3 rounded-xl hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
        </form>

        <div className="mt-8 p-6 bg-olive/10 rounded-2xl border border-olive/20">
          <h3 className="font-display font-bold text-charcoal mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-olive rounded-full"></span>
            Quick Tip
          </h3>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            Use the Admin Panel (button in top-right) to create restaurants and menus. 
            All your restaurants are automatically saved and appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSelector;

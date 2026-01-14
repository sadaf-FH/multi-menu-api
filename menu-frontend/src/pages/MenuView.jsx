import { ArrowLeft, RefreshCw, MapPin, Calendar, Tag } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import Header from '../components/Header';
import CategorySection from '../components/CategorySection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MenuView = ({ restaurantId, onBack }) => {
  const { menu, loading, error, refetch } = useMenu(restaurantId);

  // Get restaurant details from localStorage
  const storedRestaurants = JSON.parse(localStorage.getItem('restaurants') || '[]');
  const restaurant = storedRestaurants.find(r => r.id === restaurantId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!menu) return <ErrorMessage message="No menu found for this restaurant" />;

  // Filter out categories with no available items (check both Items array and item_count)
  const availableCategories = menu.Categories?.filter(cat => {
    // Check if Items array exists and has items
    const hasItems = cat.Items && Array.isArray(cat.Items) && cat.Items.length > 0;
    return hasItems;
  }) || [];

  // Calculate total items from available categories
  const totalItems = availableCategories.reduce((sum, cat) => sum + (cat.Items?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b-2 border-red-600 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <button
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Restaurant Header */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {restaurant?.name || 'Restaurant Menu'}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-red-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{restaurant?.location || 'Location'}</span>
              </div>
              
              <div className="w-px h-5 bg-red-400"></div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  Updated {new Date(menu.updatedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-red-600 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">Menu Version</div>
            <div className="text-3xl font-bold text-red-600">v{menu.version}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-2 border-red-600 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">Available Categories</div>
            <div className="text-3xl font-bold text-red-600">
              {availableCategories.length}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-2 border-red-600 shadow-sm">
            <div className="text-sm font-medium text-gray-600 mb-1">Available Items</div>
            <div className="text-3xl font-bold text-red-600">
              {totalItems}
            </div>
          </div>
        </div>

        {/* Categories */}
        {availableCategories.length > 0 ? (
          <div className="space-y-8">
            {availableCategories.map((category) => (
              <CategorySection key={category.category_id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-400 font-medium">No items available at this time</p>
            <p className="text-sm text-gray-500 mt-2">All items are currently outside their availability hours</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuView;

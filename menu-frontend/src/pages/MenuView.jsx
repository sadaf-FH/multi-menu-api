import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useMenu } from '../hooks/useMenu';
import Header from '../components/Header';
import CategorySection from '../components/CategorySection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MenuView = ({ restaurantId, onBack }) => {
  const { menu, loading, error, refetch } = useMenu(restaurantId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!menu) return <ErrorMessage message="No menu found for this restaurant" />;

  return (
    <div className="min-h-screen p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-sand/30 rounded-xl transition-all hover-lift border border-sand/50 group"
          >
            <ArrowLeft className="w-5 h-5 text-rust group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-charcoal">Back</span>
          </button>

          <button
            onClick={refetch}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rust to-olive text-cream rounded-xl hover:shadow-lg transition-all hover-lift"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-semibold">Refresh</span>
          </button>
        </div>

        {/* Header */}
        <Header
          restaurantName="Restaurant Menu"
          location="Location"
          lastUpdated={menu.updatedAt}
        />

        {/* Menu Info */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-sand/30 shadow-sm">
            <div className="text-sm text-charcoal/60 mb-1 font-medium">Menu Version</div>
            <div className="text-3xl font-display font-bold text-rust">v{menu.version}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-sand/30 shadow-sm">
            <div className="text-sm text-charcoal/60 mb-1 font-medium">Categories</div>
            <div className="text-3xl font-display font-bold text-olive">
              {menu.Categories?.length || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-sand/30 shadow-sm">
            <div className="text-sm text-charcoal/60 mb-1 font-medium">Total Items</div>
            <div className="text-3xl font-display font-bold text-charcoal">
              {menu.Categories?.reduce((sum, cat) => sum + (cat.item_count || 0), 0) || 0}
            </div>
          </div>
        </div>

        {/* Categories */}
        {menu.Categories && menu.Categories.length > 0 ? (
          menu.Categories.map((category, index) => (
            <div key={category.category_id} style={{ animationDelay: `${index * 100}ms` }}>
              <CategorySection category={category} />
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-charcoal/50 font-display">No categories available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuView;

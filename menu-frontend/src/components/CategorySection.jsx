import { UtensilsCrossed, TrendingUp, Package } from 'lucide-react';
import MenuItem from './MenuItem';

const CategorySection = ({ category }) => {
  return (
    <section className="mb-8">
      {/* Category Header */}
      <div className="bg-red-600 text-white rounded-t-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <UtensilsCrossed className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                {category.name}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-red-100 text-sm">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{category.item_count} {category.item_count === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Avg ₹{category.avg_price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="bg-white rounded-b-2xl p-6 border-x-2 border-b-2 border-red-600 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.Items?.map((item) => (
            <MenuItem key={item.item_id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;

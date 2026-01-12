import { UtensilsCrossed, TrendingUp } from 'lucide-react';
import MenuItem from './MenuItem';

const CategorySection = ({ category }) => {
  return (
    <section className="mb-16 animate-slide-up">
      <div className="mb-8 relative">
        <div className="flex items-center gap-4 mb-3">
          <UtensilsCrossed className="w-8 h-8 text-rust" strokeWidth={1.5} />
          <h2 className="text-4xl font-display font-bold text-charcoal">
            {category.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-charcoal/70">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-olive" />
            <span className="font-medium">
              Average: <span className="text-olive font-semibold">₹{category.avg_price}</span>
            </span>
          </div>
          <div className="w-px h-4 bg-charcoal/20"></div>
          <span className="font-medium">
            {category.item_count} {category.item_count === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-2 h-24 bg-gradient-to-b from-rust to-olive rounded-full opacity-30"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.Items?.map((item) => (
          <MenuItem key={item.item_id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;

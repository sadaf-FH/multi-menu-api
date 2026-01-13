import { Tag, Clock, Percent } from 'lucide-react';

const MenuItem = ({ item }) => {
  const price = item.ItemPrices?.[0];
  const hasDiscount = price?.discount > 0;
  
  // Get item name from localStorage or use default
  const itemName = item.name || localStorage.getItem(`item_name_${item.item_id}`) || 'Menu Item';

  return (
    <div className="bg-white rounded-2xl p-6 hover-lift border border-red-100 group animate-scale-in">
      <div className="mb-4">
        <h3 className="text-xl font-display font-bold text-charcoal mb-2">{itemName}</h3>
        
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-red-600" />
          <span className="text-xs text-charcoal/60 font-medium">
            {item.available_from} - {item.available_to}
          </span>
        </div>
        
        {hasDiscount && price.applied_offer && (
          <div className="inline-flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full mb-3 border border-red-200">
            <Percent className="w-3 h-3 text-red-600" />
            <span className="text-xs font-semibold text-red-600">
              {price.applied_offer.type === 'PERCENT' 
                ? `${price.applied_offer.amount}% OFF`
                : `₹${price.applied_offer.amount} OFF`
              }
            </span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-charcoal/60">
              {price?.order_type || 'DINE_IN'}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          {hasDiscount ? (
            <div>
              <div className="text-sm text-charcoal/50 line-through mb-1">
                ₹{price.base_price}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-red-600">
                  ₹{price.final_price}
                </span>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded border border-green-200">
                  Save ₹{price.discount}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-display font-bold text-charcoal">
              ₹{price?.base_price || price?.price}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;

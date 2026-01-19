import { Tag, Clock, Percent, CheckCircle, XCircle } from 'lucide-react';

const MenuItem = ({ item }) => {
  const price = item.ItemPrices?.[0];
  const hasDiscount = price?.discount > 0;
  const isAvailable = item.is_available_now;
  
  const itemName = item.name || localStorage.getItem(`item_name_${item.item_id}`) || 'Menu Item';

  return (
    <div className={`bg-gray-50 rounded-xl p-4 border-2 transition-all ${
      isAvailable 
        ? 'border-gray-200 hover:border-red-600 hover:shadow-md' 
        : 'border-gray-200 opacity-60'
    }`}>
      
      {/* Item Name and Availability Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className={`text-lg font-bold flex-1 ${isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
          {itemName}
        </h3>
        
        {/* Availability Badge */}
        {isAvailable ? (
          <div className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1 rounded-full shadow-sm flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Available</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full shadow-sm flex-shrink-0">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Unavailable</span>
          </div>
        )}
      </div>

      {/* Discount Badge - only show if available */}
      {isAvailable && hasDiscount && price.applied_offer && (
        <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-lg mb-3 shadow-sm">
          <Percent className="w-3 h-3" />
          <span className="text-xs font-bold">
            {price.applied_offer.type === 'PERCENT' 
              ? `${price.applied_offer.amount}% OFF`
              : `₹${price.applied_offer.amount} OFF`
            }
          </span>
        </div>
      )}

      {/* Time and Type Info */}
      <div className="space-y-2 mb-4">
        <div className={`flex items-center gap-2 text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
          <Clock className={`w-4 h-4 ${isAvailable ? 'text-red-600' : 'text-gray-400'}`} />
          <span>{item.available_from} - {item.available_to}</span>
        </div>
        
        <div className={`flex items-center gap-2 text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
          <Tag className={`w-4 h-4 ${isAvailable ? 'text-red-600' : 'text-gray-400'}`} />
          <span className="font-medium">{price?.order_type || 'DINE_IN'}</span>
        </div>
      </div>

      {/* Pricing */}
      <div className="pt-3 border-t-2 border-gray-300">
        {isAvailable && hasDiscount ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 line-through mb-1">
                ₹{price.base_price}
              </div>
              <div className="text-2xl font-bold text-red-600">
                ₹{price.final_price}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">You Save</div>
              <div className="text-lg font-bold text-green-600">
                ₹{price.discount}
              </div>
            </div>
          </div>
        ) : (
          <div className={`text-2xl font-bold ${isAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
            ₹{price?.base_price || price?.price}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;

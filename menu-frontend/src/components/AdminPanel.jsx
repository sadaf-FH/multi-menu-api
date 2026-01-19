import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Eye, AlertCircle, CheckCircle, Clock, DollarSign, Tag, UtensilsCrossed } from 'lucide-react';
import { createRestaurant, createMenu, createOffer, getMenuByRestaurant } from '../services/api';
import Toast from './Toast';

const toTimeFormat = (time) => time ? `${time}:00` : null;

const AdminPanel = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [storedRestaurants, setStoredRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuData, setMenuData] = useState(null);

  const [restaurant, setRestaurant] = useState({
    name: '',
    location: '',
    timezone: 'Asia/Kolkata'
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    avg_price: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    name: '',
    available_from: '',
    available_to: '',
    price: '',
    order_type: 'DINE_IN'
  });

  const [offer, setOffer] = useState({
    targetType: 'item',
    targetName: '',
    type: 'PERCENT',
    amount: '',
    max_discount: '',
    isTimeBound: false,
    available_from: '',
    available_to: ''
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const stored = localStorage.getItem('restaurants');
    if (stored) {
      const restaurants = JSON.parse(stored);
      setStoredRestaurants(restaurants);
      if (restaurants.length > 0) {
        const latest = restaurants[restaurants.length - 1];
        selectRestaurant(latest);
      }
    }
  }, []);

  const selectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    await loadMenu(restaurant.id);
  };

  const loadMenu = async (restaurantId) => {
    try {
      const response = await getMenuByRestaurant(restaurantId);
      const menuWithNames = { ...response.data };
      if (menuWithNames.Categories) {
        menuWithNames.Categories.forEach(category => {
          if (category.Items) {
            category.Items.forEach((item, idx) => {
              const storedName = localStorage.getItem(`item_name_${item.item_id}`);
              item.name = storedName || `${category.name} Item ${idx + 1}`;
            });
          }
        });
      }
      setMenuData(menuWithNames);
    } catch (error) {
      setMenuData(null);
    }
  };

  const saveRestaurant = (id, name, location) => {
    const restaurants = [...storedRestaurants, { id, name, location }];
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    setStoredRestaurants(restaurants);
    return { id, name, location };
  };

  const deleteRestaurant = (id) => {
    const restaurants = storedRestaurants.filter(r => r.id !== id);
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
    setStoredRestaurants(restaurants);
    if (selectedRestaurant?.id === id) {
      setSelectedRestaurant(restaurants.length > 0 ? restaurants[restaurants.length - 1] : null);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    
    if (!restaurant.name.trim()) {
      showToast('Please enter restaurant name', 'error');
      return;
    }
    if (!restaurant.location.trim()) {
      showToast('Please enter location', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await createRestaurant(restaurant);
      const restaurantId = response.data.R_ID;
      
      const newRestaurant = saveRestaurant(restaurantId, restaurant.name, restaurant.location);
      setSelectedRestaurant(newRestaurant);
      
      showToast('✓ Restaurant created successfully!', 'success');
      setRestaurant({ name: '', location: '', timezone: 'Asia/Kolkata' });
      
      setTimeout(() => { setActiveTab('menu'); }, 1500);
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create restaurant', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addItemToCategory = () => {
    if (!newItem.name.trim()) {
      showToast('Please enter item name', 'error');
      return;
    }
    if (!newItem.available_from) {
      showToast('⏰ Please set when this item becomes available (From time)', 'error');
      return;
    }
    if (!newItem.available_to) {
      showToast('⏰ Please set when this item stops being available (To time)', 'error');
      return;
    }
    if (!newItem.price || parseFloat(newItem.price) <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setNewCategory(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, prices: [{ order_type: newItem.order_type, price: parseFloat(newItem.price) }] }]
    }));

    setNewItem({ name: '', available_from: '', available_to: '', price: '', order_type: 'DINE_IN' });
    showToast('✓ Item added to category', 'success');
  };

  const addCategoryToMenu = () => {
    if (!newCategory.name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }
    if (!newCategory.avg_price || parseFloat(newCategory.avg_price) <= 0) {
      showToast('Please enter a valid average price', 'error');
      return;
    }
    if (newCategory.items.length === 0) {
      showToast('Please add at least one item to the category', 'error');
      return;
    }

    setCategories(prev => [...prev, { ...newCategory, avg_price: parseFloat(newCategory.avg_price) }]);
    showToast('✓ Category added to menu', 'success');
    setNewCategory({ name: '', avg_price: '', items: [] });
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();

    if (!selectedRestaurant) {
      showToast('Please select a restaurant first', 'error');
      return;
    }
    if (categories.length === 0) {
      showToast('Please add at least one category to the menu', 'error');
      return;
    }

    setLoading(true);

    try {
      const categoryItemMapping = {};
      categories.forEach(cat => {
        categoryItemMapping[cat.name] = cat.items.map(item => item.name);
      });

      const menuPayload = {
        restaurantId: selectedRestaurant.id,
        version: 1,
        categories: categories.map(cat => ({
          name: cat.name,
          avg_price: cat.avg_price,
          items: cat.items.map(item => ({
            time: {
              available_from: toTimeFormat(item.available_from),
              available_to: toTimeFormat(item.available_to)
            },
            prices: item.prices
          }))
        }))
      };

      await createMenu(menuPayload);
      
      const menuResponse = await getMenuByRestaurant(selectedRestaurant.id);
      const createdMenu = menuResponse.data;
      
      if (createdMenu.Categories) {
        createdMenu.Categories.forEach((createdCategory) => {
          const categoryName = createdCategory.name;
          const originalItemNames = categoryItemMapping[categoryName];
          
          if (originalItemNames && createdCategory.Items) {
            createdCategory.Items.forEach((createdItem, itemIdx) => {
              const itemName = originalItemNames[itemIdx];
              if (itemName) {
                localStorage.setItem(`item_name_${createdItem.item_id}`, itemName);
              }
            });
          }
        });
      }

      showToast('✓ Menu created successfully!', 'success');
      await loadMenu(selectedRestaurant.id);
      setCategories([]);
      setNewCategory({ name: '', avg_price: '', items: [] });
      
      setTimeout(() => { setActiveTab('offer'); }, 1500);
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();

    if (!menuData) {
      showToast('Please create a menu first', 'error');
      return;
    }
    if (!offer.targetName) {
      showToast('Please select an item or category', 'error');
      return;
    }
    if (!offer.amount || parseFloat(offer.amount) <= 0) {
      showToast('Please enter a valid discount amount', 'error');
      return;
    }
    if (!offer.max_discount || parseFloat(offer.max_discount) <= 0) {
      showToast('Please enter a valid max discount', 'error');
      return;
    }
    if (offer.isTimeBound && (!offer.available_from || !offer.available_to)) {
      showToast('⏰ Please set offer time range', 'error');
      return;
    }

    setLoading(true);

    try {
      let targetId = null;

      if (offer.targetType === 'item') {
        for (const category of menuData.Categories) {
          const item = category.Items.find(i => i.name === offer.targetName);
          if (item) {
            targetId = item.item_id;
            break;
          }
        }
      } else {
        const category = menuData.Categories.find(c => c.name === offer.targetName);
        if (category) targetId = category.category_id;
      }

      if (!targetId) {
        showToast('Item/category not found', 'error');
        setLoading(false);
        return;
      }

      const offerData = {
        type: offer.type,
        amount: parseFloat(offer.amount),
        max_discount: parseFloat(offer.max_discount),
        [offer.targetType === 'item' ? 'item_id' : 'category_id']: targetId
      };

      if (offer.isTimeBound) {
        offerData.available_from = toTimeFormat(offer.available_from);
        offerData.available_to = toTimeFormat(offer.available_to);
      }

      await createOffer(offerData);
      showToast('✓ Offer created successfully!', 'success');
      setOffer({ targetType: 'item', targetName: '', type: 'PERCENT', amount: '', max_discount: '', isTimeBound: false, available_from: '', available_to: '' });
      await loadMenu(selectedRestaurant.id);
      
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create offer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-red-600">
          {/* Header */}
          <div className="bg-red-600 text-white p-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Restaurant Admin Panel</h1>
            <p className="text-red-100 text-sm mt-1">Create and manage your restaurant menu in 3 simple steps</p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white border-b-2 border-gray-200 p-4">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className={`flex items-center gap-2 ${activeTab === 'restaurant' ? 'text-red-600' : selectedRestaurant ? 'text-green-600' : 'text-gray-400'}`}>
                {selectedRestaurant ? <CheckCircle className="w-6 h-6"/> : <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">1</div>}
                <span className="font-semibold text-sm sm:text-base">Restaurant</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className={`flex items-center gap-2 ${activeTab === 'menu' ? 'text-red-600' : menuData ? 'text-green-600' : 'text-gray-400'}`}>
                {menuData ? <CheckCircle className="w-6 h-6"/> : <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">2</div>}
                <span className="font-semibold text-sm sm:text-base">Menu</span>
              </div>
              <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
              <div className={`flex items-center gap-2 ${activeTab === 'offer' ? 'text-red-600' : 'text-gray-400'}`}>
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">3</div>
                <span className="font-semibold text-sm sm:text-base">Offers</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-red-600">
            {['restaurant', 'menu', 'offer'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 font-semibold text-sm sm:text-base transition-colors ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-red-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* RESTAURANT TAB */}
            {activeTab === 'restaurant' && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Step 1: Create or Select Restaurant</h3>
                      <p className="text-sm text-blue-800">Enter your restaurant details below or select an existing one from the saved list.</p>
                    </div>
                  </div>
                </div>

                {storedRestaurants.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Saved Restaurants</h3>
                      <button 
                        onClick={() => {
                          if(confirm('Clear all restaurants? This cannot be undone.')){
                            localStorage.removeItem('restaurants');
                            setStoredRestaurants([]);
                            setSelectedRestaurant(null);
                          }
                        }} 
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3"/> Clear All
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {storedRestaurants.map(r => (
                        <div key={r.id} className={`p-3 rounded-lg border-2 flex justify-between items-center transition-all ${
                          selectedRestaurant?.id === r.id ? 'bg-green-50 border-green-600 shadow-sm' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{r.name}</div>
                            <div className="text-xs text-gray-500 truncate">{r.location}</div>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button 
                              onClick={() => selectRestaurant(r)} 
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                selectedRestaurant?.id === r.id 
                                  ? 'bg-green-600 text-white' 
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {selectedRestaurant?.id === r.id ? '✓ Selected' : 'Select'}
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm(`Delete "${r.name}"? This cannot be undone.`)) deleteRestaurant(r.id);
                              }} 
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateRestaurant} className="space-y-4 bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-red-600"/>
                    Create New Restaurant
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 required">Restaurant Name</label>
                    <input 
                      type="text" 
                      value={restaurant.name} 
                      onChange={e => setRestaurant({...restaurant, name: e.target.value})} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none transition-colors text-base" 
                      placeholder="e.g., The Spice Garden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 required">Location</label>
                    <input 
                      type="text" 
                      value={restaurant.location} 
                      onChange={e => setRestaurant({...restaurant, location: e.target.value})} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none transition-colors text-base" 
                      placeholder="e.g., Bangalore, India"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Timezone</label>
                    <select 
                      value={restaurant.timezone} 
                      onChange={e => setRestaurant({...restaurant, timezone: e.target.value})} 
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none transition-colors text-base"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (India)</option>
                      <option value="America/New_York">America/New_York (US East)</option>
                      <option value="Europe/London">Europe/London (UK)</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-base shadow-lg"
                  >
                    {loading ? (
                      <>Creating...</>
                    ) : (
                      <><Save className="w-5 h-5"/>Create Restaurant & Continue →</>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Step 2: Build Your Menu</h3>
                      <p className="text-sm text-blue-800">Add categories (like "Italian", "Chinese") and items with their prices and availability hours.</p>
                    </div>
                  </div>
                </div>

                {selectedRestaurant ? (
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-600 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Creating menu for:</div>
                        <div className="font-bold text-gray-900 text-lg">{selectedRestaurant.name}</div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('restaurant')} 
                        className="px-4 py-2 bg-white rounded-lg text-sm border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      >
                        Change Restaurant
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200 text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 mb-3 font-medium">Please select or create a restaurant first</p>
                    <button 
                      onClick={() => setActiveTab('restaurant')} 
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      ← Go to Restaurants
                    </button>
                  </div>
                )}

                {categories.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-600 shadow-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Categories Ready ({categories.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 flex justify-between items-center border-2 border-blue-300 shadow-sm">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate flex items-center gap-2">
                              <UtensilsCrossed className="w-4 h-4 text-red-600"/>
                              {cat.name}
                            </div>
                            <div className="text-xs text-gray-600">{cat.items.length} items • Avg ₹{cat.avg_price}</div>
                          </div>
                          <button 
                            onClick={() => {
                              if(confirm(`Remove "${cat.name}" category?`)) {
                                setCategories(categories.filter((_,i)=>i!==idx));
                                showToast('Category removed', 'info');
                              }
                            }} 
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Menu Form */}
                <div className="bg-gray-50 rounded-lg p-5 border-2 border-gray-300">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                    <Plus className="w-6 h-6 text-red-600"/>
                    Add New Category
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 required">Category Name</label>
                        <input 
                          type="text" 
                          value={newCategory.name} 
                          onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                          placeholder="e.g., Italian, Chinese, Desserts" 
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 required">Average Price (₹)</label>
                        <input 
                          type="number" 
                          value={newCategory.avg_price} 
                          onChange={e => setNewCategory({...newCategory, avg_price: e.target.value})} 
                          placeholder="200" 
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base bg-gray-50"
                        />
                      </div>
                    </div>

                    {newCategory.items.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Items in "{newCategory.name}" ({newCategory.items.length})</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {newCategory.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">{item.name}</div>
                                <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3"/>₹{item.prices[0].price}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3"/>{item.available_from}-{item.available_to}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setNewCategory({...newCategory, items: newCategory.items.filter((_,i)=>i!==idx)});
                                  showToast('Item removed', 'info');
                                }} 
                                className="ml-2 text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4"/>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Item Form */}
                    <div className="bg-white rounded-lg p-5 border-2 border-dashed border-red-400">
                      <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-red-600"/>Add Item to Category
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2 required">Item Name</label>
                          <input 
                            type="text" 
                            value={newItem.name} 
                            onChange={e => setNewItem({...newItem, name: e.target.value})} 
                            placeholder="e.g., Margherita Pizza, Chicken Tikka" 
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white shadow-sm"
                          />
                        </div>

                        {/* IMPROVED TIME PICKER SECTION */}
                        <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-5 h-5 text-yellow-700"/>
                            <h5 className="font-bold text-gray-900">⏰ Availability Hours (Required)</h5>
                          </div>
                          <p className="text-xs text-gray-700 mb-3">Set when this item is available to order</p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-bold text-gray-900 mb-2 required">From Time</label>
                              <input 
                                type="time" 
                                value={newItem.available_from} 
                                onChange={e => setNewItem({...newItem, available_from: e.target.value})} 
                                className="w-full px-4 py-3 border-2 border-yellow-500 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white shadow-sm"
                                required
                              />
                              <p className="text-xs text-gray-600 mt-1">When it starts</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-bold text-gray-900 mb-2 required">To Time</label>
                              <input 
                                type="time" 
                                value={newItem.available_to} 
                                onChange={e => setNewItem({...newItem, available_to: e.target.value})} 
                                className="w-full px-4 py-3 border-2 border-yellow-500 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white shadow-sm"
                                required
                              />
                              <p className="text-xs text-gray-600 mt-1">When it ends</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 required">Price (₹)</label>
                            <input 
                              type="number" 
                              value={newItem.price} 
                              onChange={e => setNewItem({...newItem, price: e.target.value})} 
                              placeholder="299" 
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white shadow-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Order Type</label>
                            <select 
                              value={newItem.order_type} 
                              onChange={e => setNewItem({...newItem, order_type: e.target.value})} 
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white shadow-sm"
                            >
                              <option value="DINE_IN">Dine In</option>
                              <option value="TAKEAWAY">Takeaway</option>
                              <option value="DELIVERY">Delivery</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={addItemToCategory} 
                          className="w-full bg-gray-700 text-white py-3 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors shadow-md"
                        >
                          + Add Item to Category
                        </button>
                      </div>
                    </div>

                  <button 
                    type="button" 
                    onClick={addCategoryToMenu} 
                    className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-base shadow-lg"
                  >
                    ✓ Save "{newCategory.name || 'Category'}" to Menu
                  </button>
                  </div>
                </div>

                {categories.length > 0 && (
                  <button 
                    onClick={handleCreateMenu} 
                    disabled={loading} 
                    className="w-full bg-green-600 text-white py-5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-lg shadow-xl"
                  >
                    {loading ? 'Creating Menu...' : <><Save className="w-6 h-6"/>Create Complete Menu ({categories.length} {categories.length===1?'Category':'Categories'}) →</>}
                  </button>
                )}

              </div>
            )}
            {activeTab === 'offer' && (
              <form onSubmit={handleCreateOffer} className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Step 3: Create Offers (Optional)</h3>
                      <p className="text-sm text-blue-800">Add discounts to items or categories. Skip if you don't want offers.</p>
                    </div>
                  </div>
                </div>

                {selectedRestaurant && (
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-600 shadow-sm">
                    <div className="text-xs text-gray-600 font-medium">Creating offer for:</div>
                    <div className="font-bold text-gray-900 text-lg">{selectedRestaurant.name}</div>
                  </div>
                )}

                {!menuData ? (
                  <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200 text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-700 mb-3 font-medium">Create a menu first before adding offers</p>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('menu')} 
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      ← Go to Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">Apply Discount To</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, targetType: 'item', targetName: ''})} 
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            offer.targetType==='item' ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-bold text-base text-gray-900">Single Item</div>
                          <div className="text-xs text-gray-600 mt-1">One menu item</div>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, targetType: 'category', targetName: ''})} 
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            offer.targetType==='category' ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-bold text-base text-gray-900">Entire Category</div>
                          <div className="text-xs text-gray-600 mt-1">All items</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2 required">
                        Select {offer.targetType==='item'?'Item':'Category'}
                      </label>
                      <select 
                        value={offer.targetName} 
                        onChange={e => setOffer({...offer, targetName: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base" 
                        required
                      >
                        <option value="">-- Choose {offer.targetType==='item'?'an item':'a category'} --</option>
                        {offer.targetType==='category' ? (
                          menuData.Categories.map(cat => 
                            <option key={cat.category_id} value={cat.name}>
                              {cat.name} ({cat.item_count} items)
                            </option>
                          )
                        ) : (
                          menuData.Categories.map(cat => 
                            cat.Items.map(item => 
                              <option key={item.item_id} value={item.name}>
                                {item.name} ({cat.name}) - ₹{item.ItemPrices[0]?.base_price}
                              </option>
                            )
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">Discount Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, type: 'PERCENT'})} 
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            offer.type==='PERCENT' ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-bold text-base text-gray-900">Percentage %</div>
                          <div className="text-xs text-gray-600 mt-1">e.g., 20% off</div>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, type: 'FLAT'})} 
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            offer.type==='FLAT' ? 'border-red-600 bg-red-50 shadow-md' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="font-bold text-base text-gray-900">Flat Amount ₹</div>
                          <div className="text-xs text-gray-600 mt-1">e.g., ₹50 off</div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 required">
                          Discount {offer.type==='PERCENT'?'(%)':'(₹)'}
                        </label>
                        <input 
                          type="number" 
                          value={offer.amount} 
                          onChange={e => setOffer({...offer, amount: e.target.value})} 
                          placeholder={offer.type==='PERCENT'?'20':'50'} 
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base" 
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 required">Max Discount (₹)</label>
                        <input 
                          type="number" 
                          value={offer.max_discount} 
                          onChange={e => setOffer({...offer, max_discount: e.target.value})} 
                          placeholder="100" 
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-base" 
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-400">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={offer.isTimeBound} 
                          onChange={e => setOffer({...offer, isTimeBound: e.target.checked})} 
                          className="w-5 h-5 text-red-600 border-2 border-gray-400 rounded focus:ring-red-600 mt-0.5"
                        />
                        <div>
                          <div className="text-sm font-bold text-gray-900">⏰ Time-Bound Offer (Optional)</div>
                          <div className="text-xs text-gray-700 mt-1">Make offer active only during specific hours (e.g., happy hour 5-7pm)</div>
                        </div>
                      </label>

                      {offer.isTimeBound && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1 required">Offer From</label>
                            <input 
                              type="time" 
                              value={offer.available_from} 
                              onChange={e => setOffer({...offer, available_from: e.target.value})} 
                              className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white"
                              required={offer.isTimeBound}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-gray-900 mb-1 required">Offer To</label>
                            <input 
                              type="time" 
                              value={offer.available_to} 
                              onChange={e => setOffer({...offer, available_to: e.target.value})} 
                              className="w-full px-3 py-2 border-2 border-yellow-400 rounded-lg focus:border-red-600 focus:outline-none text-base bg-white"
                              required={offer.isTimeBound}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || !offer.targetName} 
                      className="w-full bg-red-600 text-white py-4 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-base shadow-lg"
                    >
                      {loading ? 'Creating...' : <><Save className="w-5 h-5"/>Create Offer</>}
                    </button>

                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!menuData) {
                            showToast('⚠️ Please create a menu first', 'error');
                            return;
                          }
                          onSuccess && onSuccess(selectedRestaurant.id);
                        }}
                        disabled={!menuData}
                        className={`text-sm font-medium underline ${
                          menuData 
                            ? 'text-gray-600 hover:text-gray-900' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Skip offers and view menu →
                      </button>
                    </div>

                    {selectedRestaurant && (
                      <button 
                        type="button" 
                        onClick={() => {
                          if (!menuData) {
                            showToast('⚠️ Please create a menu first before viewing', 'error');
                            return;
                          }
                          onSuccess && onSuccess(selectedRestaurant.id);
                        }} 
                        disabled={!menuData}
                        className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 text-base shadow-lg transition-colors ${
                          menuData 
                            ? 'bg-gray-800 text-white hover:bg-gray-900' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Eye className="w-5 h-5"/>
                        {menuData ? '✓ Done - View Menu' : '⚠️ Create Menu First'}
                      </button>
                    )}
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
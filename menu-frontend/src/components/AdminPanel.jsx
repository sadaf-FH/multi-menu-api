import { useState, useEffect } from 'react';
import { Plus, Save, X, Clock, Trash2, Eye } from 'lucide-react';
import { createRestaurant, createMenu, createOffer, getMenuByRestaurant } from '../services/api';

// Helper to convert HH:MM to HH:MM:SS
const toTimeFormat = (time) => time ? `${time}:00` : null;

const AdminPanel = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
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
      setMenuData(response.data);
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
    setLoading(true);
    setMessage(null);

    try {
      const response = await createRestaurant(restaurant);
      const restaurantId = response.data.R_ID;
      
      const newRestaurant = saveRestaurant(restaurantId, restaurant.name, restaurant.location);
      setSelectedRestaurant(newRestaurant);
      
      setMessage({ type: 'success', text: `Restaurant created successfully` });
      setRestaurant({ name: '', location: '', timezone: 'Asia/Kolkata' });
      
      setTimeout(() => { setActiveTab('menu'); setMessage(null); }, 1500);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create restaurant' });
    } finally {
      setLoading(false);
    }
  };

  const addItemToCategory = () => {
    if (!newItem.name || !newItem.available_from || !newItem.available_to || !newItem.price) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setNewCategory(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, prices: [{ order_type: newItem.order_type, price: parseFloat(newItem.price) }] }]
    }));

    setNewItem({ name: '', available_from: '', available_to: '', price: '', order_type: 'DINE_IN' });
    setMessage({ type: 'success', text: 'Item added' });
  };

  const addCategoryToMenu = () => {
    if (!newCategory.name || !newCategory.avg_price || newCategory.items.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one item' });
      return;
    }

    setCategories(prev => [...prev, { ...newCategory, avg_price: parseFloat(newCategory.avg_price) }]);
    setMessage({ type: 'success', text: 'Category added' });
    setNewCategory({ name: '', avg_price: '', items: [] });
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!selectedRestaurant || categories.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one category' });
      setLoading(false);
      return;
    }

    try {
      const menuPayload = {
        restaurantId: selectedRestaurant.id,
        version: 1,
        categories: categories.map(cat => ({
          name: cat.name,
          avg_price: cat.avg_price,
          items: cat.items.map(item => ({
            name: item.name,                 
            time: {
              available_from: toTimeFormat(item.available_from),
              available_to: toTimeFormat(item.available_to)
            },
            prices: item.prices
          }))
        }))
      };

      await createMenu(menuPayload);

      setMessage({ type: 'success', text: 'Menu created successfully' });
      await loadMenu(selectedRestaurant.id);
      setCategories([]);
      setNewCategory({ name: '', avg_price: '', items: [] });
      
      setTimeout(() => { setActiveTab('offer'); setMessage(null); }, 1500);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create menu' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!menuData) {
      setMessage({ type: 'error', text: 'Please create a menu first' });
      setLoading(false);
      return;
    }

    if (offer.isTimeBound && (!offer.available_from || !offer.available_to)) {
      setMessage({ type: 'error', text: 'Please set offer time range' });
      setLoading(false);
      return;
    }

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
        setMessage({ type: 'error', text: 'Item/category not found' });
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
      setMessage({ type: 'success', text: 'Offer created successfully' });
      setOffer({ targetType: 'item', targetName: '', type: 'PERCENT', amount: '', max_discount: '', isTimeBound: false, available_from: '', available_to: '' });
      await loadMenu(selectedRestaurant.id);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create offer' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-red-600">
          {/* Header */}
          <div className="bg-red-600 text-white p-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Panel</h1>
            <p className="text-red-100 text-sm mt-1">Manage your restaurant menu</p>
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

          {/* Messages */}
          {message && (
            <div className={`m-4 p-3 rounded-lg flex items-center justify-between text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-300 text-green-800' 
                : 'bg-red-50 border border-red-300 text-red-800'
            }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* RESTAURANT TAB */}
            {activeTab === 'restaurant' && (
              <div className="space-y-4">
                {storedRestaurants.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Saved Restaurants</h3>
                      <button 
                        onClick={() => {
                          if(confirm('Clear all restaurants?')){
                            localStorage.removeItem('restaurants');
                            setStoredRestaurants([]);
                            setSelectedRestaurant(null);
                          }
                        }} 
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3"/> Clear
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {storedRestaurants.map(r => (
                        <div key={r.id} className={`p-3 rounded-lg border-2 flex justify-between items-center ${
                          selectedRestaurant?.id === r.id ? 'bg-red-50 border-red-600' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{r.name}</div>
                            <div className="text-xs text-gray-500 truncate">{r.location}</div>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button 
                              onClick={() => selectRestaurant(r)} 
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                            >
                              Select
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm(`Delete "${r.name}"?`)) deleteRestaurant(r.id);
                              }} 
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateRestaurant} className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Create Restaurant</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={restaurant.name} 
                      onChange={e => setRestaurant({...restaurant, name: e.target.value})} 
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none" 
                      placeholder="Restaurant name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={restaurant.location} 
                      onChange={e => setRestaurant({...restaurant, location: e.target.value})} 
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none" 
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select 
                      value={restaurant.timezone} 
                      onChange={e => setRestaurant({...restaurant, timezone: e.target.value})} 
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Restaurant'}
                  </button>
                </form>
              </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                {selectedRestaurant ? (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-600">Creating menu for</div>
                        <div className="font-semibold text-gray-900">{selectedRestaurant.name}</div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('restaurant')} 
                        className="px-3 py-1 bg-white rounded text-xs border border-green-300 text-gray-700 hover:bg-gray-50"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                    <p className="text-sm text-gray-700 mb-2">Select a restaurant first</p>
                    <button 
                      onClick={() => setActiveTab('restaurant')} 
                      className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Go to Restaurants
                    </button>
                  </div>
                )}

                {categories.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-2">Categories ({categories.length})</h3>
                    <div className="space-y-2">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 flex justify-between items-center border border-blue-200">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{cat.name}</div>
                            <div className="text-xs text-gray-500">{cat.items.length} items • ₹{cat.avg_price}</div>
                          </div>
                          <button 
                            onClick={() => setCategories(categories.filter((_,i)=>i!==idx))} 
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Add Category</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category Name</label>
                        <input 
                          type="text" 
                          value={newCategory.name} 
                          onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                          placeholder="Italian" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Average Price</label>
                        <input 
                          type="number" 
                          value={newCategory.avg_price} 
                          onChange={e => setNewCategory({...newCategory, avg_price: e.target.value})} 
                          placeholder="200" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    {newCategory.items.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-300">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Items ({newCategory.items.length})</h4>
                        <div className="space-y-2">
                          {newCategory.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start p-2 bg-gray-50 rounded border border-gray-200">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">{item.name}</div>
                                <div className="text-xs text-gray-500">₹{item.prices[0].price} • {item.available_from}-{item.available_to}</div>
                              </div>
                              <button 
                                onClick={() => setNewCategory({...newCategory, items: newCategory.items.filter((_,i)=>i!==idx)})} 
                                className="ml-2 text-red-600 hover:bg-red-50 rounded p-1"
                              >
                                <X className="w-3 h-3"/>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                      <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                        <Plus className="w-4 h-4"/>Add Item
                      </h4>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                          <input 
                            type="text" 
                            value={newItem.name} 
                            onChange={e => setNewItem({...newItem, name: e.target.value})} 
                            placeholder="Margherita Pizza" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                            <input 
                              type="time" 
                              value={newItem.available_from} 
                              onChange={e => setNewItem({...newItem, available_from: e.target.value})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                            <input 
                              type="time" 
                              value={newItem.available_to} 
                              onChange={e => setNewItem({...newItem, available_to: e.target.value})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input 
                              type="number" 
                              value={newItem.price} 
                              onChange={e => setNewItem({...newItem, price: e.target.value})} 
                              placeholder="299" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                            <select 
                              value={newItem.order_type} 
                              onChange={e => setNewItem({...newItem, order_type: e.target.value})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
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
                          className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                        >
                          Add Item
                        </button>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={addCategoryToMenu} 
                      disabled={!newCategory.name || !newCategory.avg_price || newCategory.items.length===0} 
                      className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                {categories.length > 0 && (
                  <button 
                    onClick={handleCreateMenu} 
                    disabled={loading} 
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Menu...' : `Create Menu (${categories.length} ${categories.length===1?'Category':'Categories'})`}
                  </button>
                )}
              </div>
            )}

            {/* OFFER TAB */}
            {activeTab === 'offer' && (
              <form onSubmit={handleCreateOffer} className="space-y-4">
                {selectedRestaurant && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs text-gray-600">Creating offer for</div>
                    <div className="font-semibold text-gray-900">{selectedRestaurant.name}</div>
                  </div>
                )}

                {!menuData && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
                    <p className="text-sm text-gray-700 mb-2">Create a menu first</p>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('menu')} 
                      className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Go to Menu
                    </button>
                  </div>
                )}

                {menuData && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apply Offer To</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, targetType: 'item', targetName: ''})} 
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            offer.targetType==='item' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">Specific Item</div>
                          <div className="text-xs text-gray-500">One menu item</div>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, targetType: 'category', targetName: ''})} 
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            offer.targetType==='category' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">Category</div>
                          <div className="text-xs text-gray-500">All items in category</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select {offer.targetType==='item'?'Item':'Category'}
                      </label>
                      <select 
                        value={offer.targetName} 
                        onChange={e => setOffer({...offer, targetName: e.target.value})} 
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none" 
                        required
                      >
                        <option value="">-- Select --</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, type: 'PERCENT'})} 
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            offer.type==='PERCENT' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">Percentage</div>
                          <div className="text-xs text-gray-500">e.g., 20% off</div>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setOffer({...offer, type: 'FLAT'})} 
                          className={`p-3 rounded-lg border-2 text-left transition-colors ${
                            offer.type==='FLAT' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">Flat Amount</div>
                          <div className="text-xs text-gray-500">e.g., ₹50 off</div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {offer.type==='PERCENT'?'Discount (%)':'Discount (₹)'}
                        </label>
                        <input 
                          type="number" 
                          value={offer.amount} 
                          onChange={e => setOffer({...offer, amount: e.target.value})} 
                          placeholder={offer.type==='PERCENT'?'20':'50'} 
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none" 
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                        <input 
                          type="number" 
                          value={offer.max_discount} 
                          onChange={e => setOffer({...offer, max_discount: e.target.value})} 
                          placeholder="100" 
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none" 
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={offer.isTimeBound} 
                          onChange={e => setOffer({...offer, isTimeBound: e.target.checked})} 
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Time-Bound Offer</div>
                          <div className="text-xs text-gray-500">Active only during specific hours</div>
                        </div>
                      </label>

                      {offer.isTimeBound && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <Clock className="w-3 h-3 inline mr-1"/>From
                            </label>
                            <input 
                              type="time" 
                              value={offer.available_from} 
                              onChange={e => setOffer({...offer, available_from: e.target.value})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                              required={offer.isTimeBound}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <Clock className="w-3 h-3 inline mr-1"/>To
                            </label>
                            <input 
                              type="time" 
                              value={offer.available_to} 
                              onChange={e => setOffer({...offer, available_to: e.target.value})} 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-600 focus:outline-none text-sm"
                              required={offer.isTimeBound}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading || !offer.targetName} 
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Offer'}
                    </button>

                    {selectedRestaurant && (
                      <button 
                        type="button" 
                        onClick={() => onSuccess && onSuccess(selectedRestaurant.id)} 
                        className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-5 h-5"/>View Menu
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
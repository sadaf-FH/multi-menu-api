import { useState, useEffect } from 'react';
import { Plus, Save, X, Clock, Trash2, Eye } from 'lucide-react';
import { createRestaurant, createMenu, createOffer, getMenuByRestaurant } from '../services/api';

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
    max_discount: ''
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
      
      // Add names to items
      const menuWithNames = { ...response.data };
      if (menuWithNames.Categories) {
        menuWithNames.Categories.forEach(category => {
          if (category.Items) {
            category.Items.forEach((item, idx) => {
              // Try to get name from stored data
              const storedName = localStorage.getItem(`item_name_${item.item_id}`);
              item.name = storedName || `${category.name} Item ${idx + 1}`;
            });
          }
        });
      }
      
      setMenuData(menuWithNames);
    } catch (error) {
      console.log('No menu found yet');
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
      
      setMessage({ type: 'success', text: `"${restaurant.name}" created! → Menu tab` });
      setRestaurant({ name: '', location: '', timezone: 'Asia/Kolkata' });
      
      setTimeout(() => { setActiveTab('menu'); setMessage(null); }, 1500);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  const addItemToCategory = () => {
    if (!newItem.name || !newItem.available_from || !newItem.available_to || !newItem.price) {
      setMessage({ type: 'error', text: 'Fill all item fields' });
      return;
    }

    setNewCategory(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, prices: [{ order_type: newItem.order_type, price: parseFloat(newItem.price) }] }]
    }));

    setNewItem({ name: '', available_from: '', available_to: '', price: '', order_type: 'DINE_IN' });
    setMessage({ type: 'success', text: `"${newItem.name}" added` });
  };

  const addCategoryToMenu = () => {
    if (!newCategory.name || !newCategory.avg_price || newCategory.items.length === 0) {
      setMessage({ type: 'error', text: 'Add at least one item' });
      return;
    }

    setCategories(prev => [...prev, { ...newCategory, avg_price: parseFloat(newCategory.avg_price) }]);
    setMessage({ type: 'success', text: `"${newCategory.name}" category added` });
    setNewCategory({ name: '', avg_price: '', items: [] });
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!selectedRestaurant || categories.length === 0) {
      setMessage({ type: 'error', text: 'Select restaurant and add categories' });
      setLoading(false);
      return;
    }

    try {
      // Prepare menu data without names
      const menuPayload = {
        restaurantId: selectedRestaurant.id,
        version: 1,
        categories: categories.map(cat => ({
          name: cat.name,
          avg_price: cat.avg_price,
          items: cat.items.map(item => ({
            time: {
              available_from: item.available_from,
              available_to: item.available_to
            },
            prices: item.prices
          }))
        }))
      };

      await createMenu(menuPayload);
      
      // After creating, fetch menu to get IDs, then store names
      const menuResponse = await getMenuByRestaurant(selectedRestaurant.id);
      const createdMenu = menuResponse.data;
      
      // Map names to IDs
      if (createdMenu.Categories) {
        createdMenu.Categories.forEach((createdCategory, catIdx) => {
          const originalCategory = categories[catIdx];
          if (createdCategory.Items && originalCategory) {
            createdCategory.Items.forEach((createdItem, itemIdx) => {
              const originalItem = originalCategory.items[itemIdx];
              if (originalItem && originalItem.name) {
                localStorage.setItem(`item_name_${createdItem.item_id}`, originalItem.name);
              }
            });
          }
        });
      }

      setMessage({ type: 'success', text: 'Menu created! → Offers tab' });
      await loadMenu(selectedRestaurant.id);
      setCategories([]);
      setNewCategory({ name: '', avg_price: '', items: [] });
      
      setTimeout(() => { setActiveTab('offer'); setMessage(null); }, 1500);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!menuData) {
      setMessage({ type: 'error', text: 'Create menu first' });
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
        setMessage({ type: 'error', text: 'Target not found' });
        setLoading(false);
        return;
      }

      const offerData = {
        type: offer.type,
        amount: parseFloat(offer.amount),
        max_discount: parseFloat(offer.max_discount),
        [offer.targetType === 'item' ? 'item_id' : 'category_id']: targetId
      };

      await createOffer(offerData);
      setMessage({ type: 'success', text: `Offer created for "${offer.targetName}"!` });
      setOffer({ targetType: 'item', targetName: '', type: 'PERCENT', amount: '', max_discount: '' });
      await loadMenu(selectedRestaurant.id);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8">
            <h1 className="text-4xl font-display font-bold mb-2">Admin Panel</h1>
            <p className="text-red-100">Manage restaurants, menus, and offers</p>
          </div>

          <div className="flex border-b border-red-100">
            {['restaurant', 'menu', 'offer'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-charcoal/60 hover:bg-red-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {message && (
            <div className={`m-6 p-4 rounded-xl flex items-center justify-between ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <span className="font-medium">{message.text}</span>
              <button onClick={() => setMessage(null)}><X className="w-5 h-5" /></button>
            </div>
          )}

          <div className="p-8">
            {activeTab === 'restaurant' && (
              <div className="space-y-6">
                {storedRestaurants.length > 0 && (
                  <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="font-display font-bold text-charcoal mb-4 flex justify-between">
                      <span>Restaurants ({storedRestaurants.length})</span>
                      <button onClick={() => {if(confirm('Clear all?')){localStorage.removeItem('restaurants');setStoredRestaurants([]);setSelectedRestaurant(null);}}} className="text-xs text-red-600 flex items-center gap-1">
                        <Trash2 className="w-3 h-3"/> Clear All
                      </button>
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {storedRestaurants.map(r => (
                        <div key={r.id} className={`p-4 rounded-xl border-2 flex justify-between ${selectedRestaurant?.id === r.id ? 'bg-red-50 border-red-600' : 'bg-white border-red-100'}`}>
                          <div>
                            <div className="font-semibold text-lg">{r.name}</div>
                            <div className="text-sm text-charcoal/60">{r.location}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => selectRestaurant(r)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700">Select</button>
                            <button onClick={() => {if(confirm(`Delete "${r.name}"?`))deleteRestaurant(r.id);}} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleCreateRestaurant} className="space-y-6">
                  <h3 className="font-display font-bold text-2xl">Create Restaurant</h3>
                  <input type="text" value={restaurant.name} onChange={e => setRestaurant({...restaurant, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-red-100 focus:border-red-600 focus:outline-none" placeholder="Restaurant Name" required/>
                  <input type="text" value={restaurant.location} onChange={e => setRestaurant({...restaurant, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-red-100 focus:border-red-600 focus:outline-none" placeholder="Location" required/>
                  <select value={restaurant.timezone} onChange={e => setRestaurant({...restaurant, timezone: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-red-100 focus:border-red-600 focus:outline-none">
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                  <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? 'Creating...' : <><Save className="w-5 h-5"/>Create Restaurant</>}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'menu' && (
              <div className="space-y-6">
                {selectedRestaurant ? (
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200 flex justify-between">
                    <div>
                      <div className="text-xs text-charcoal/60">Menu for:</div>
                      <div className="font-display font-bold text-xl">{selectedRestaurant.name}</div>
                    </div>
                    <button onClick={() => setActiveTab('restaurant')} className="px-4 py-2 bg-white rounded-xl text-sm text-red-600 border border-red-200">Change</button>
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
                    <p className="text-sm mb-3">No restaurant selected</p>
                    <button onClick={() => setActiveTab('restaurant')} className="px-6 py-3 bg-red-600 text-white rounded-xl">Select Restaurant</button>
                  </div>
                )}

                {categories.length > 0 && (
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="font-display font-bold mb-4">Ready ({categories.length})</h3>
                    {categories.map((cat, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 flex justify-between mb-2 border border-blue-200">
                        <div>
                          <div className="font-semibold">{cat.name}</div>
                          <div className="text-sm text-charcoal/60">{cat.items.length} items • ₹{cat.avg_price}</div>
                        </div>
                        <button onClick={() => setCategories(categories.filter((_,i)=>i!==idx))} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                  <h3 className="text-xl font-display font-bold mb-4"><Plus className="w-5 h-5 inline mr-2 text-red-600"/>Add Category</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="Category Name" className="px-4 py-3 rounded-xl border border-red-200 focus:border-red-600 focus:outline-none"/>
                      <input type="number" value={newCategory.avg_price} onChange={e => setNewCategory({...newCategory, avg_price: e.target.value})} placeholder="Avg Price" className="px-4 py-3 rounded-xl border border-red-200 focus:border-red-600 focus:outline-none"/>
                    </div>

                    {newCategory.items.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-red-200">
                        <h4 className="font-semibold mb-3">Items ({newCategory.items.length})</h4>
                        {newCategory.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between p-3 bg-red-50 rounded-lg mb-2">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-charcoal/60">₹{item.prices[0].price} • {item.available_from}-{item.available_to}</div>
                            </div>
                            <button onClick={() => setNewCategory({...newCategory, items: newCategory.items.filter((_,i)=>i!==idx)})} className="text-red-600"><X className="w-4 h-4"/></button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-4 border-2 border-dashed border-red-300">
                      <h4 className="font-semibold mb-3"><Plus className="w-4 h-4 inline mr-1 text-red-600"/>Add Item</h4>
                      <div className="space-y-3">
                        <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Item Name (e.g., Margherita Pizza)" className="w-full px-3 py-2 rounded-lg border border-red-200 focus:border-red-600 focus:outline-none text-sm"/>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" value={newItem.available_from} onChange={e => setNewItem({...newItem, available_from: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-red-200 focus:border-red-600 focus:outline-none text-sm"/>
                          <input type="text" value={newItem.available_to} onChange={e => setNewItem({...newItem, available_to: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-red-200 focus:border-red-600 focus:outline-none text-sm"/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="Price" className="w-full px-3 py-2 rounded-lg border border-red-200 focus:border-red-600 focus:outline-none text-sm"/>
                          <select value={newItem.order_type} onChange={e => setNewItem({...newItem, order_type: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-red-200 focus:border-red-600 focus:outline-none text-sm">
                            <option value="DINE_IN">DINE IN</option>
                            <option value="TAKEAWAY">TAKEAWAY</option>
                            <option value="DELIVERY">DELIVERY</option>
                          </select>
                        </div>
                        <button type="button" onClick={addItemToCategory} className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 text-sm">Add Item</button>
                      </div>
                    </div>

                    <button type="button" onClick={addCategoryToMenu} disabled={!newCategory.name || !newCategory.avg_price || newCategory.items.length===0} className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50">Add Category to Menu</button>
                  </div>
                </div>

                {categories.length > 0 && (
                  <button onClick={handleCreateMenu} disabled={loading} className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? 'Creating...' : <><Save className="w-5 h-5"/>Create Menu ({categories.length} {categories.length===1?'Category':'Categories'})</>}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'offer' && (
              <form onSubmit={handleCreateOffer} className="space-y-6">
                {selectedRestaurant && (
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                    <div className="text-xs text-charcoal/60">Offer for:</div>
                    <div className="font-display font-bold text-xl">{selectedRestaurant.name}</div>
                  </div>
                )}

                {!menuData && (
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-center">
                    <p className="text-sm mb-3">No menu found. Create menu first.</p>
                    <button type="button" onClick={() => setActiveTab('menu')} className="px-6 py-3 bg-red-600 text-white rounded-xl">Go to Menu</button>
                  </div>
                )}

                {menuData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setOffer({...offer, targetType: 'item', targetName: ''})} className={`p-4 rounded-xl border-2 ${offer.targetType==='item'?'border-red-600 bg-red-50':'border-red-200'}`}>
                        <div className="font-semibold">Specific Item</div>
                        <div className="text-xs text-charcoal/60">One item</div>
                      </button>
                      <button type="button" onClick={() => setOffer({...offer, targetType: 'category', targetName: ''})} className={`p-4 rounded-xl border-2 ${offer.targetType==='category'?'border-red-600 bg-red-50':'border-red-200'}`}>
                        <div className="font-semibold">Entire Category</div>
                        <div className="text-xs text-charcoal/60">All items</div>
                      </button>
                    </div>

                    <select value={offer.targetName} onChange={e => setOffer({...offer, targetName: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-red-100 focus:border-red-600 focus:outline-none" required>
                      <option value="">-- Select {offer.targetType==='item'?'Item':'Category'} --</option>
                      {offer.targetType==='category' ? (
                        menuData.Categories.map(cat => <option key={cat.category_id} value={cat.name}>{cat.name} ({cat.item_count} items)</option>)
                      ) : (
                        menuData.Categories.map(cat => cat.Items.map(item => <option key={item.item_id} value={item.name}>{item.name} ({cat.name}) - ₹{item.ItemPrices[0]?.base_price}</option>))
                      )}
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setOffer({...offer, type: 'PERCENT'})} className={`p-4 rounded-xl border-2 ${offer.type==='PERCENT'?'border-red-600 bg-red-50':'border-red-200'}`}>
                        <div className="font-semibold">Percentage</div>
                        <div className="text-xs text-charcoal/60">e.g., 20% off</div>
                      </button>
                      <button type="button" onClick={() => setOffer({...offer, type: 'FLAT'})} className={`p-4 rounded-xl border-2 ${offer.type==='FLAT'?'border-red-600 bg-red-50':'border-red-200'}`}>
                        <div className="font-semibold">Flat Amount</div>
                        <div className="text-xs text-charcoal/60">e.g., ₹50 off</div>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" value={offer.amount} onChange={e => setOffer({...offer, amount: e.target.value})} placeholder={offer.type==='PERCENT'?'20':'50'} className="w-full px-4 py-3 rounded-xl border-2 border-red-100 focus:border-red-600 focus:outline-none" required/>
                      <input type="number" value={offer.max_discount} onChange={e => setOffer({...offer, max_discount: e.target.value})} placeholder="Max ₹100" className="w-full px-4 py-3 rounded-xl border-2 border-red-100 focus:border-red-600 focus:outline-none" required/>
                    </div>

                    <button type="submit" disabled={loading || !offer.targetName} className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? 'Creating...' : <><Save className="w-5 h-5"/>Create Offer</>}
                    </button>

                    {selectedRestaurant && (
                      <button type="button" onClick={() => onSuccess && onSuccess(selectedRestaurant.id)} className="w-full bg-charcoal text-white py-4 rounded-xl font-semibold hover:bg-charcoal/90 flex items-center justify-center gap-2">
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
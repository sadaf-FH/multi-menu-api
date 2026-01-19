import { useState } from 'react';
import { Settings, Eye } from 'lucide-react';
import RestaurantSelector from './components/RestaurantSelector';
import MenuView from './pages/MenuView';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleViewMenu = (restaurantId) => {
    if (!restaurantId) {
      showToast('⚠️ Please create a restaurant and menu first before viewing', 'error');
      return;
    }
    setSelectedRestaurant(restaurantId);
    setShowAdmin(false);
  };

  return (
    <div className="min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Toggle Button */}
      <button
        onClick={() => {
          setShowAdmin(!showAdmin);
          setSelectedRestaurant(null);
        }}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-all font-medium"
      >
        {showAdmin ? (
          <>
            <Eye className="w-5 h-5" />
            <span className="hidden sm:inline">View Menu</span>
          </>
        ) : (
          <>
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Admin Panel</span>
          </>
        )}
      </button>

      {/* Content */}
      {showAdmin ? (
        <AdminPanel onSuccess={handleViewMenu} />
      ) : !selectedRestaurant ? (
        <RestaurantSelector onSelect={setSelectedRestaurant} />
      ) : (
        <MenuView
          restaurantId={selectedRestaurant}
          onBack={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
}

export default App;

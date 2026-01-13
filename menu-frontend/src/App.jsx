import { useState } from 'react';
import { Settings, Eye } from 'lucide-react';
import RestaurantSelector from './components/RestaurantSelector';
import MenuView from './pages/MenuView';
import AdminPanel from './components/AdminPanel';

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Toggle Button */}
      <button
        onClick={() => {
          setShowAdmin(!showAdmin);
          setSelectedRestaurant(null);
        }}
        className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rust to-olive text-cream rounded-xl shadow-lg hover:shadow-xl transition-all hover-lift"
      >
        {showAdmin ? (
          <>
            <Eye className="w-5 h-5" />
            <span className="font-semibold">View Menu</span>
          </>
        ) : (
          <>
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Admin Panel</span>
          </>
        )}
      </button>

      {/* Content */}
      {showAdmin ? (
        <AdminPanel onSuccess={(id) => {
          setSelectedRestaurant(id);
          setShowAdmin(false);
        }} />
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

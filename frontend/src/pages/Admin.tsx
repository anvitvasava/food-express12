import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { 
  BarChart, 
  Plus, 
  MapPin, 
  ShoppingBag, 
  Settings, 
  PlusCircle, 
  FolderPlus, 
  Eye, 
  ShieldAlert, 
  IndianRupee 
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'restaurants' | 'orders'>('dashboard');
  const [stats, setStats] = useState<any | null>(null);
  const [restaurantsList, setRestaurantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Add Restaurant
  const [restName, setRestName] = useState('');
  const [restDesc, setRestDesc] = useState('');
  const [restImg, setRestImg] = useState('');
  const [restTime, setRestTime] = useState('20');
  const [restDist, setRestDist] = useState('1.5');
  const [restFee, setRestFee] = useState('20');
  const [restCategories, setRestCategories] = useState('Pizza, Fast Food');

  // Form states for Add Menu Item
  const [selectedRestId, setSelectedRestId] = useState('');
  const [dishName, setDishName] = useState('');
  const [dishDesc, setDishDesc] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('Pizza');
  const [dishIsVeg, setDishIsVeg] = useState(true);

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats();
      const rests = await api.getRestaurants();
      setStats(statsData);
      setRestaurantsList(rests);
    } catch (err) {
      showToast('Failed to load administrative details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigate('/home');
      return;
    }
    loadAdminData();
  }, [user, navigate, showToast]);

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restName || !restDesc || !restImg) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    try {
      await api.addRestaurant({
        name: restName,
        description: restDesc,
        image: restImg,
        deliveryTime: Number(restTime),
        distance: Number(restDist),
        deliveryFee: Number(restFee),
        categories: restCategories.split(',').map(s => s.trim())
      });
      showToast('New restaurant added successfully!', 'success');
      // Reset
      setRestName('');
      setRestDesc('');
      setRestImg('');
      loadAdminData();
    } catch (err) {
      showToast('Failed to add restaurant.', 'error');
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestId || !dishName || !dishPrice) {
      showToast('Please enter item name, price, and select restaurant.', 'error');
      return;
    }
    try {
      await api.addMenuItem(selectedRestId, {
        name: dishName,
        description: dishDesc,
        price: Number(dishPrice),
        category: dishCategory,
        isVeg: dishIsVeg
      });
      showToast('Menu item added successfully!', 'success');
      // Reset
      setDishName('');
      setDishDesc('');
      setDishPrice('');
      loadAdminData();
    } catch (err) {
      showToast('Failed to add menu item.', 'error');
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      showToast(`Order status updated to ${nextStatus.toUpperCase()}`, 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold">Access Denied</h3>
        <p className="text-slate-500 text-sm">You do not have administrative privileges to access this area.</p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="text-center py-20 flex justify-center items-center gap-2 text-xs text-slate-400">
        <span className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full"></span>
        Loading admin console...
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Stats Overview', icon: BarChart },
    { id: 'restaurants' as const, label: 'Restaurant Setup', icon: Settings },
    { id: 'orders' as const, label: 'Order Monitor', icon: ShoppingBag }
  ];

  return (
    <div className="space-y-8">
      
      {/* Admin Title Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Admin Console
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor deliveries, metrics, and configure restaurant menus.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Tab 1: Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Metric Blocks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
                <h4 className="text-lg sm:text-2xl font-black text-slate-850 dark:text-white mt-1 flex items-center">
                  <IndianRupee className="w-4 h-4 text-emerald-500" /> {stats.metrics.totalSales}
                </h4>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                <h4 className="text-lg sm:text-2xl font-black text-slate-850 dark:text-white mt-1">{stats.metrics.totalOrders}</h4>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Orders</p>
                <h4 className="text-lg sm:text-2xl font-black text-indigo-500 mt-1">{stats.metrics.activeOrders}</h4>
              </div>
              <div className="glass p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Restaurants</p>
                <h4 className="text-lg sm:text-2xl font-black text-slate-850 dark:text-white mt-1">{stats.metrics.totalRestaurants}</h4>
              </div>
            </div>

            {/* Category breakdown sold */}
            <div className="glass p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Popular Cuisines (Items Sold)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats.categoryBreakdown).map(([cat, qty]: any) => (
                  <div key={cat} className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                    <p className="text-sm font-black text-brand mt-1">{qty} sold</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Restaurant Setup & Menus configuration */}
        {activeTab === 'restaurants' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Add Restaurant Form */}
            <div className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <FolderPlus className="w-5 h-5 text-indigo-500" />
                Add New Restaurant
              </h3>
              
              <form onSubmit={handleAddRestaurant} className="space-y-3">
                <input
                  type="text"
                  placeholder="Restaurant Name (e.g. Swagath Restaurant)"
                  value={restName}
                  onChange={(e) => setRestName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (e.g. Authentic South Indian food)"
                  value={restDesc}
                  onChange={(e) => setRestDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL (Unsplash or web address)"
                  value={restImg}
                  onChange={(e) => setRestImg(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />
                
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Time (mins)"
                    value={restTime}
                    onChange={(e) => setRestTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs text-center focus:ring-2"
                  />
                  <input
                    type="text"
                    placeholder="Dist (km)"
                    value={restDist}
                    onChange={(e) => setRestDist(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs text-center focus:ring-2"
                  />
                  <input
                    type="number"
                    placeholder="Fee (₹)"
                    value={restFee}
                    onChange={(e) => setRestFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs text-center focus:ring-2"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Categories (comma separated, e.g. Pizza, Salad, Desserts)"
                  value={restCategories}
                  onChange={(e) => setRestCategories(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                />

                <button 
                  type="submit"
                  className="w-full bg-indigo-650 hover:bg-indigo-700 bg-indigo-600 text-white text-xs font-bold py-3 rounded-xl shadow-md"
                >
                  Create Restaurant
                </button>
              </form>
            </div>

            {/* Add Menu Item Form */}
            <div className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                Add Menu Item
              </h3>

              <form onSubmit={handleAddMenuItem} className="space-y-3">
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none font-semibold text-slate-700"
                  required
                >
                  <option value="">Select Restaurant</option>
                  {restaurantsList.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Dish Name (e.g. Masala Dosa)"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />

                <input
                  type="text"
                  placeholder="Dish Description"
                  value={dishDesc}
                  onChange={(e) => setDishDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Category (e.g. South Indian)"
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2"
                  />
                </div>

                <div className="py-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={dishIsVeg}
                      onChange={(e) => setDishIsVeg(e.target.checked)}
                      className="rounded border-slate-350 text-brand" 
                    />
                    Is Vegetarian Dish
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl shadow-md"
                >
                  Add Dish to Restaurant
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 3: Order Monitoring & Status Changer */}
        {activeTab === 'orders' && (
          <div className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Live Order Monitor</h3>
            
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">No orders placed on system yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Restaurant</th>
                      <th className="py-3 px-2">Items</th>
                      <th className="py-3 px-2">Total</th>
                      <th className="py-3 px-2">Current Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {stats.recentOrders.map((ord: any) => (
                      <tr key={ord.id} className="text-slate-700 dark:text-slate-300">
                        <td className="py-3 px-2 font-mono font-bold text-indigo-500">{ord.id}</td>
                        <td className="py-3 px-2 font-bold">{ord.restaurantName}</td>
                        <td className="py-3 px-2 text-slate-500 truncate max-w-[150px]">
                          {ord.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                        </td>
                        <td className="py-3 px-2 font-bold">₹{ord.pricing.total}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-full uppercase text-[10px] font-bold ${
                            ord.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand/10 text-brand'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                            className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-[10px] font-bold outline-none cursor-pointer"
                          >
                            <option value="placed">Placed</option>
                            <option value="accepted">Accepted</option>
                            <option value="preparing">Preparing</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="on_the_way">On The Way</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

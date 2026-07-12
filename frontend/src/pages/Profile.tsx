import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { 
  User, 
  MapPin, 
  History, 
  Trash2, 
  Plus, 
  Clock, 
  ShoppingBag, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, token, deleteAddress, addAddress } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected Tab State
  const initialTab = searchParams.get('tab') || 'info';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  // Address add form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrLine, setAddrLine] = useState('');
  const [addrInstructions, setAddrInstructions] = useState('');

  // Order history state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      showToast('Please log in to access your profile.', 'info');
      navigate('/login');
    }
  }, [token, navigate, showToast]);

  // Sync state if user loads later
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  // Load orders if history tab is selected
  useEffect(() => {
    if (activeTab === 'history' && token) {
      const loadOrders = async () => {
        setOrdersLoading(true);
        try {
          const data = await api.getOrders();
          setOrders(data);
        } catch (err) {
          showToast('Failed to load order history.', 'error');
        } finally {
          setOrdersLoading(false);
        }
      };
      loadOrders();
    }
  }, [activeTab, token, showToast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({ name, email, phone });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine.trim()) return;
    try {
      await addAddress(addrTitle, addrLine, addrInstructions);
      showToast('Address added successfully!', 'success');
      setAddrLine('');
      setAddrInstructions('');
      setShowAddressForm(false);
    } catch (err) {
      showToast('Failed to add address.', 'error');
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(addrId);
      showToast('Address deleted successfully.', 'success');
    } catch (err) {
      showToast('Failed to delete address.', 'error');
    }
  };

  if (!user) return null;

  const tabs = [
    { id: 'info', label: 'User Information', icon: User },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'history', label: 'Order History', icon: History }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* Profile Sidebar Switcher */}
      <aside className="w-full md:w-64 glass rounded-3xl border border-slate-100 dark:border-slate-800 p-4 space-y-2">
        <div className="px-3 py-4 border-b border-slate-100 dark:border-slate-800 mb-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-rose-500 flex items-center justify-center text-white font-extrabold text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{user.name}</h4>
            <p className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded-full mt-1 uppercase w-max tracking-wider">
              {user.role}
            </p>
          </div>
        </div>

        {tabs.map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-md shadow-brand/10'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <IconComp className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Profile Pages Container */}
      <div className="flex-1 w-full glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 min-h-[400px]">
        
        {/* Tab 1: User Info */}
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 focus:ring-2 focus:ring-brand/40 outline-none text-xs font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 focus:ring-2 focus:ring-brand/40 outline-none text-xs font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-400">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 focus:ring-2 focus:ring-brand/40 outline-none text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-brand-dark transition-all shadow-md active:scale-95"
            >
              {loading ? 'Saving...' : 'Update Profiles'}
            </button>
          </form>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Saved Addresses</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-brand hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3 max-w-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Label</label>
                    <select
                      value={addrTitle}
                      onChange={(e) => setAddrTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-brand/40 outline-none"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Address Line</label>
                  <input
                    type="text"
                    placeholder="Locality, building details, street name, city"
                    value={addrLine}
                    onChange={(e) => setAddrLine(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions</label>
                  <input
                    type="text"
                    placeholder="Rider instructions..."
                    value={addrInstructions}
                    onChange={(e) => setAddrInstructions(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="text-xs font-semibold px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-dark transition-all"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {user.addresses.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-500">No addresses saved yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-2xl flex justify-between items-start gap-4 hover:shadow-sm transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-brand tracking-wider bg-brand/10 px-2 py-0.5 rounded-md">
                        {addr.title}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-2.5">
                        {addr.addressLine}
                      </p>
                      {addr.instructions && (
                        <p className="text-[10px] text-slate-400 font-semibold mt-1.5 italic">
                          Instructions: {addr.instructions}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Order History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Order History
            </h3>

            {ordersLoading ? (
              <div className="text-center py-20 flex justify-center items-center gap-2 text-xs text-slate-400">
                <span className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full"></span>
                Fetching past orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No orders found</h4>
                  <p className="text-xs text-slate-400">You have not placed any orders yet.</p>
                </div>
                <Link to="/home" className="inline-block bg-brand text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-brand-dark">
                  Order Food
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-2xl space-y-4 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{ord.restaurantName}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Ordered on {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ord.orderStatus === 'delivered' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-indigo-500/10 text-indigo-500 animate-pulse'
                        }`}>
                          {ord.orderStatus}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white">₹{ord.pricing.total}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-50 dark:border-slate-800/80 pt-3 flex justify-between items-center text-xs">
                      <div className="text-slate-500 font-semibold line-clamp-1 max-w-sm">
                        {ord.items.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                      </div>

                      {ord.orderStatus !== 'delivered' && ord.orderStatus !== 'cancelled' ? (
                        <Link
                          to={`/order-tracking/${ord.id}`}
                          className="bg-brand text-white text-[11px] font-extrabold px-4 py-2 rounded-xl hover:bg-brand-dark transition-all shadow-md"
                        >
                          Track Live
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            showToast(`Reordering from ${ord.restaurantName}...`, 'info');
                            navigate(`/restaurant/${ord.restaurantId}`);
                          }}
                          className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-4 py-2 font-bold text-slate-700 dark:text-slate-300"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { 
  MapPin, 
  Clock, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  HelpCircle, 
  Plus, 
  ChevronRight, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Checkout: React.FC = () => {
  const { user, addAddress } = useAuth();
  const { cartItems, restaurantId, couponCode, tip, clearCart, getPricingSummary } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Selected state
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi' | 'wallet'>('card');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // Custom states
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Address Form States
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrLine, setAddrLine] = useState('');
  const [addrInstructions, setAddrInstructions] = useState('');

  // Stripe card mockup inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const pricing = getPricingSummary(25);

  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    // Redirect if user not logged in
    if (!user) {
      showToast('Please log in to complete your checkout.', 'info');
      navigate('/login');
      return;
    }
    // Auto-select first address if available
    if (user.addresses.length > 0) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, cartItems, navigate, showToast]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine.trim()) return;
    try {
      await addAddress(addrTitle, addrLine, addrInstructions);
      showToast('Address saved successfully!', 'success');
      setAddrLine('');
      setAddrInstructions('');
      setShowAddressForm(false);
      // Select the newly added address automatically (the last item)
      if (user && user.addresses.length > 0) {
        setSelectedAddressId(user.addresses[user.addresses.length - 1].id);
      }
    } catch (err) {
      showToast('Failed to save address.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a delivery address.', 'error');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVC)) {
      showToast('Please complete credit card details.', 'error');
      return;
    }

    const chosenAddress = user?.addresses.find(a => a.id === selectedAddressId);
    if (!chosenAddress) return;

    setLoading(true);

    const payload = {
      restaurantId,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations
      })),
      deliveryAddress: {
        title: chosenAddress.title,
        addressLine: chosenAddress.addressLine
      },
      deliveryInstructions: deliveryInstructions || chosenAddress.instructions,
      scheduledTime: scheduleMode === 'later' ? scheduleTime : undefined,
      paymentMethod,
      couponCode: couponCode || undefined,
      tipAmount: tip
    };

    try {
      const response = await api.createOrder(payload);
      showToast('Order placed successfully!', 'success');
      clearCart();
      navigate(`/order-tracking/${response.order.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Column: Details forms */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* 1. Address Section */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Delivery Address</h3>
            </div>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-xs text-brand hover:underline font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddNewAddress} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
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
                  placeholder="Street name, floor, flat number, city"
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery Instructions (optional)</label>
                <input
                  type="text"
                  placeholder="Drop at door, ring bell twice, call on arrival"
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
            <div className="text-center py-4">
              <p className="text-xs text-slate-500">No saved addresses found. Please add one to continue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    selectedAddressId === addr.id
                      ? 'border-brand bg-brand/5 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold uppercase text-brand tracking-wider bg-brand/10 px-2.5 py-0.5 rounded-md">
                      {addr.title}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-3 line-clamp-2">
                      {addr.addressLine}
                    </p>
                  </div>
                  {addr.instructions && (
                    <p className="text-[10px] text-slate-400 font-medium mt-2 line-clamp-1 italic">
                      Note: {addr.instructions}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Schedule & Instructions Section */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
          
          {/* Scheduling */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Delivery Schedule</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScheduleMode('now')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  scheduleMode === 'now'
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Deliver Now (25-30 mins)
              </button>
              <button
                onClick={() => setScheduleMode('later')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  scheduleMode === 'later'
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Schedule for Later
              </button>
            </div>

            {scheduleMode === 'later' && (
              <div className="max-w-xs pt-1">
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />
              </div>
            )}
          </div>

          {/* Delivery Partner Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Instructions</h4>
            <div className="flex flex-wrap gap-2">
              {["Avoid calling", "Leave at gate", "Don't ring bell", "Drop at door"].map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => setDeliveryInstructions(prev => prev ? `${prev}, ${inst}` : inst)}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-full text-xs text-slate-600 dark:text-slate-400 font-semibold"
                >
                  {inst}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Add other instructions for delivery rider..."
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
            />
          </div>
        </div>

        {/* 3. Payment Methods */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Payment Option</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                paymentMethod === 'card'
                  ? 'border-brand bg-brand/5 text-brand font-bold'
                  : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">Credit/Debit</span>
            </button>

            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                paymentMethod === 'upi'
                  ? 'border-brand bg-brand/5 text-brand font-bold'
                  : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs">UPI / GPay</span>
            </button>

            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                paymentMethod === 'wallet'
                  ? 'border-brand bg-brand/5 text-brand font-bold'
                  : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-xs">Wallet</span>
            </button>

            <button
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                paymentMethod === 'cod'
                  ? 'border-brand bg-brand/5 text-brand font-bold'
                  : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">💵</span>
              <span className="text-xs">Cash / COD</span>
            </button>
          </div>

          {paymentMethod === 'card' && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">Card Information (Stripe Mock)</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Card Number (4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none text-center"
                    required
                  />
                  <input
                    type="password"
                    placeholder="CVC"
                    maxLength={3}
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-brand/40 outline-none text-center"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
              ⚡ You will be prompted to verify UPI transaction inside your Google Pay or PhonePe app on phone.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Pricing Summary and Checkout Button */}
      <div className="space-y-6">
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Order Pricing</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="text-slate-800 dark:text-slate-200">₹{pricing.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-slate-800 dark:text-slate-200">₹{pricing.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Packing & GST Taxes</span>
              <span className="text-slate-800 dark:text-slate-200">₹{pricing.packingFee + pricing.tax}</span>
            </div>
            {pricing.tip > 0 && (
              <div className="flex justify-between text-brand">
                <span>Rider Tip</span>
                <span>₹{pricing.tip}</span>
              </div>
            )}
            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied</span>
                <span>-₹{pricing.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-slate-800 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>Grand Total</span>
              <span>₹{pricing.total}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Processing Payment...' : 'Place Order'}
          </button>
        </div>
      </div>

    </div>
  );
};

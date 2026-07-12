import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { Trash2, Plus, Minus, Tag, Bike, Receipt, ArrowRight, ShoppingBag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { 
    cartItems, 
    restaurantName, 
    couponCode, 
    discount, 
    tip, 
    removeFromCart, 
    updateQuantity, 
    applyCoupon, 
    setTip, 
    getPricingSummary 
  } = useCart();

  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [customTipActive, setCustomTipActive] = useState(false);
  const [customTipValue, setCustomTipValue] = useState('');

  const pricing = getPricingSummary(25); // Pass default delivery fee as 25

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    const success = applyCoupon(couponInput);
    if (success) {
      showToast(`Coupon ${couponInput.toUpperCase()} applied successfully!`, 'success');
      setCouponInput('');
    } else {
      showToast('Invalid coupon code. Try EXPRESS50 or FREEDEL.', 'error');
    }
  };

  const handleTipClick = (amount: number) => {
    setTip(amount);
    setCustomTipActive(false);
  };

  const handleCustomTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(customTipValue);
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }
    setTip(parsed);
    setCustomTipActive(false);
    showToast(`Added ₹${parsed} tip for rider!`, 'success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10 text-slate-400 dark:text-slate-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Cart is Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Add some delicious dishes from your favorite restaurants!</p>
        </div>
        <Link 
          to="/home" 
          className="inline-block bg-brand text-white text-xs font-extrabold px-6 py-3 rounded-full hover:bg-brand-dark transition-all shadow-md shadow-brand/20 active:scale-95"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* Left Columns: Cart Items List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Order Summary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">From {restaurantName}</p>
            </div>
            <span className="text-xs font-semibold bg-brand/10 text-brand px-3 py-1 rounded-full">
              {cartItems.length} Items
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {cartItems.map((item) => (
              <div key={item.uniqueKey} className="py-4 flex gap-4 items-start justify-between first:pt-0 last:pb-0">
                <div className="flex gap-4">
                  
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />

                  {/* Title & customizations */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="space-y-0.5">
                        {Object.entries(item.customizations).map(([title, selectedOpts]) => (
                          <p key={title} className="text-[10px] text-slate-400 font-semibold leading-none">
                            <span className="font-extrabold">{title}:</span> {selectedOpts.join(', ')}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-xs font-extrabold text-slate-800 dark:text-white pt-1">₹{item.price}</p>
                  </div>
                </div>

                {/* Incrementor and Delete */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.uniqueKey, -1)}
                      className="text-slate-400 hover:text-slate-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.uniqueKey, 1)}
                      className="text-slate-400 hover:text-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.uniqueKey)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Delivery Partner Tip selection */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-brand" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Delivery Partner Tip</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Thank your delivery partner by leaving a tip. 100% of this tip goes directly to them.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[20, 30, 50].map((amount) => (
              <button
                key={amount}
                onClick={() => handleTipClick(amount)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  tip === amount && !customTipActive
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                ₹{amount}
              </button>
            ))}
            <button
              onClick={() => setCustomTipActive(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                customTipActive
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              Custom
            </button>
          </div>

          {customTipActive && (
            <form onSubmit={handleCustomTipSubmit} className="flex gap-2 max-w-xs pt-2">
              <input
                type="number"
                placeholder="Enter tip amount"
                value={customTipValue}
                onChange={(e) => setCustomTipValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 text-xs focus:ring-2 focus:ring-brand/40 outline-none"
                required
              />
              <button 
                type="submit"
                className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-brand-dark transition-all"
              >
                Add
              </button>
            </form>
          )}

          {tip > 0 && (
            <p className="text-xs text-brand font-semibold">
              Thank you! ₹{tip} has been added to your order as a tip.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Pricing Summary */}
      <div className="space-y-6">
        {/* Coupon Card */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Apply Coupon</h4>
          </div>

          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon (EXPRESS50)"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 text-xs focus:ring-2 focus:ring-brand/40 outline-none uppercase font-semibold"
            />
            <button 
              type="submit"
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all flex-shrink-0"
            >
              APPLY
            </button>
          </form>

          {couponCode && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-3 text-xs font-semibold flex justify-between items-center">
              <span>Promo {couponCode} Applied</span>
              <span>-₹{discount || pricing.discount}</span>
            </div>
          )}
        </div>

        {/* Bill Details */}
        <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Receipt className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Bill Details</h4>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="text-slate-800 dark:text-slate-200">₹{pricing.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-slate-800 dark:text-slate-200">{pricing.deliveryFee > 0 ? `₹${pricing.deliveryFee}` : 'FREE'}</span>
            </div>
            <div className="flex justify-between">
              <span>Packing & Handling Fee</span>
              <span className="text-slate-800 dark:text-slate-200">₹{pricing.packingFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & GST (5%)</span>
              <span className="text-slate-800 dark:text-slate-200">₹{pricing.tax}</span>
            </div>
            {pricing.tip > 0 && (
              <div className="flex justify-between text-brand">
                <span>Rider Tip</span>
                <span>₹{pricing.tip}</span>
              </div>
            )}
            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount Code</span>
                <span>-₹{pricing.discount}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm font-extrabold text-slate-800 dark:text-white border-t border-slate-100 dark:border-slate-800 pt-3">
              <span>To Pay</span>
              <span>₹{pricing.total}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

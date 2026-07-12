import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { Star, Clock, MapPin, Bike, Search, Check, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user, toggleFavorite } = useAuth();

  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filtering & search
  const [menuSearch, setMenuSearch] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string | null>(null);

  // Customization Dialog State
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);
  const [customizationSelections, setCustomizationSelections] = useState<{ [title: string]: string[] }>({});
  const [customizationQuantity, setCustomizationQuantity] = useState(1);

  // Favorites state
  const isFavorite = user?.favorites?.restaurants.includes(id || '') || false;

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getRestaurantById(id);
        setRestaurant(data);
      } catch (err) {
        showToast('Restaurant details could not be loaded.', 'error');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantDetails();
  }, [id, navigate, showToast]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      showToast('Please log in to add restaurants to favorites.', 'info');
      navigate('/login');
      return;
    }
    if (!id) return;
    try {
      await toggleFavorite('restaurant', id);
      showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites!', 'success');
    } catch (err) {
      showToast('Failed to update favorites.', 'error');
    }
  };

  // Add Item triggering customizations modal or direct cart add
  const handleAddItemClick = (dish: any) => {
    if (dish.customizations && dish.customizations.length > 0) {
      setSelectedDish(dish);
      // Initialize selections with required defaults
      const defaults: { [title: string]: string[] } = {};
      dish.customizations.forEach((cust: any) => {
        if (cust.required && cust.options.length > 0) {
          defaults[cust.title] = [cust.options[0].name];
        } else {
          defaults[cust.title] = [];
        }
      });
      setCustomizationSelections(defaults);
      setCustomizationQuantity(1);
      setCustModalOpen(true);
    } else {
      addToCart(restaurant.id, restaurant.name, dish);
      showToast(`Added ${dish.name} to cart`, 'success');
    }
  };

  const handleCustomizationSelect = (title: string, optionName: string, multiSelect: boolean) => {
    const currentSelected = customizationSelections[title] || [];
    let nextSelected: string[] = [];

    if (multiSelect) {
      if (currentSelected.includes(optionName)) {
        nextSelected = currentSelected.filter(n => n !== optionName);
      } else {
        nextSelected = [...currentSelected, optionName];
      }
    } else {
      nextSelected = [optionName];
    }

    setCustomizationSelections({
      ...customizationSelections,
      [title]: nextSelected
    });
  };

  const submitCustomizations = () => {
    // Validate required options are chosen
    let valid = true;
    selectedDish.customizations.forEach((cust: any) => {
      if (cust.required && (!customizationSelections[cust.title] || customizationSelections[cust.title].length === 0)) {
        showToast(`Please make a selection for ${cust.title}.`, 'error');
        valid = false;
      }
    });

    if (!valid) return;

    addToCart(restaurant.id, restaurant.name, selectedDish, customizationSelections, customizationQuantity);
    showToast(`Added custom ${selectedDish.name} to cart`, 'success');
    setCustModalOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 sm:h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="space-y-3">
          <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  // Extract menu categories
  const menuCategories = Array.from(new Set(restaurant.menu.map((m: any) => m.category)));

  // Filter menu
  const filteredMenu = restaurant.menu.filter((dish: any) => {
    const matchesSearch = dish.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          dish.description.toLowerCase().includes(menuSearch.toLowerCase());
    
    const matchesVeg = vegFilter === 'all' || 
                       (vegFilter === 'veg' && dish.isVeg) || 
                       (vegFilter === 'nonveg' && !dish.isVeg);

    const matchesCategory = !selectedMenuCategory || dish.category === selectedMenuCategory;

    return matchesSearch && matchesVeg && matchesCategory;
  });

  return (
    <div className="space-y-8">
      
      {/* 1. Restaurant Banner */}
      <div className="relative rounded-3xl overflow-hidden h-64 sm:h-80 shadow-xl shadow-slate-100 dark:shadow-none">
        <img
          src={restaurant.bannerImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          
          {/* Favorite Toggle Button */}
          <button 
            onClick={handleFavoriteToggle}
            className="absolute top-6 right-6 p-2.5 rounded-full glass hover:scale-105 transition-all text-white hover:text-rose-500"
          >
            <Heart className={`w-5.5 h-5.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>

          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">{restaurant.name}</h2>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">{restaurant.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{restaurant.rating} ({restaurant.reviewCount}+ ratings)</span>
              </div>

              <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{restaurant.deliveryTime} mins</span>
              </div>

              <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{restaurant.distance} km</span>
              </div>

              <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1">
                <Bike className="w-3.5 h-3.5" />
                <span>{restaurant.deliveryFee > 0 ? `₹${restaurant.deliveryFee} Del Fee` : 'Free Delivery'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Menu Search & Filters */}
      <section className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass border border-slate-100 dark:border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search within menu..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand/40 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Veg Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setVegFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              vegFilter === 'all'
                ? 'border-brand bg-brand/5 text-brand'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setVegFilter('veg')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              vegFilter === 'veg'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 border border-emerald-500 rounded flex items-center justify-center p-[2px]"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span></span>
            Veg
          </button>
          <button
            onClick={() => setVegFilter('nonveg')}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              vegFilter === 'nonveg'
                ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <span className="w-2.5 h-2.5 border border-rose-500 rounded flex items-center justify-center p-[2px]"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span></span>
            Non-Veg
          </button>
        </div>
      </section>

      {/* 3. Category Sections & Menu Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Category Navigator */}
        <aside className="w-full lg:w-56 glass rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sticky top-24 z-20">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Menu Sections</h4>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-x-visible">
            <button
              onClick={() => setSelectedMenuCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 lg:flex-shrink ${
                selectedMenuCategory === null
                  ? 'bg-brand/10 text-brand'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
            >
              Full Menu ({restaurant.menu.length})
            </button>
            {menuCategories.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedMenuCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 lg:flex-shrink ${
                  selectedMenuCategory === cat
                    ? 'bg-brand/10 text-brand'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Side: Dishes List */}
        <div className="flex-1 w-full space-y-6">
          {filteredMenu.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-500">No menu items match your current search/filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenu.map((dish: any) => (
                <div
                  key={dish.id}
                  className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-md transition-all justify-between"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3.5 h-3.5 border rounded flex items-center justify-center p-[2px] flex-shrink-0 ${
                        dish.isVeg ? 'border-emerald-500' : 'border-rose-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      </span>
                      {dish.isBestseller && (
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                          🔥 Best Seller
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                      {dish.name}
                    </h4>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {dish.description}
                    </p>

                    <p className="text-sm font-extrabold text-slate-900 dark:text-white pt-1">
                      ₹{dish.price}
                    </p>
                  </div>

                  {/* Thumbnail and Add Button */}
                  <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={() => handleAddItemClick(dish)}
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-950/95 hover:bg-brand hover:text-white text-brand text-xs font-extrabold py-1 px-4 rounded-xl shadow-md border border-slate-100 dark:border-slate-800/80 active:scale-95 transition-all"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Food Customization Modal */}
      {custModalOpen && selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-md w-full overflow-hidden shadow-2xl animate-in scale-in duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
              <div>
                <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{selectedDish.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your customizations below</p>
              </div>
              <button 
                onClick={() => setCustModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Customization Options List */}
            <div className="p-5 max-h-96 overflow-y-auto space-y-6">
              {selectedDish.customizations.map((cust: any) => (
                <div key={cust.title} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{cust.title}</span>
                    <div className="flex items-center gap-1">
                      {cust.required ? (
                        <span className="bg-brand/10 text-brand text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Required</span>
                      ) : (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">Optional</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cust.options.map((opt: any) => {
                      const isSelected = (customizationSelections[cust.title] || []).includes(opt.name);
                      return (
                        <button
                          key={opt.name}
                          onClick={() => handleCustomizationSelect(cust.title, opt.name, cust.multiSelect)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-brand bg-brand/5 text-slate-800 dark:text-white'
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-md border flex items-center justify-center p-[2px] transition-colors ${
                              isSelected ? 'bg-brand border-brand text-white' : 'border-slate-300 dark:border-slate-700'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </span>
                            {opt.name}
                          </span>
                          {opt.price > 0 && <span className="text-slate-500 font-extrabold">+₹{opt.price}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary & Add Button */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              {/* Quantity selectors */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm">
                <button 
                  onClick={() => setCustomizationQuantity(Math.max(1, customizationQuantity - 1))}
                  className="font-bold text-slate-400 hover:text-slate-800"
                >
                  -
                </button>
                <span className="text-xs font-extrabold w-5 text-center">{customizationQuantity}</span>
                <button 
                  onClick={() => setCustomizationQuantity(customizationQuantity + 1)}
                  className="font-bold text-slate-400 hover:text-slate-800"
                >
                  +
                </button>
              </div>

              <button
                onClick={submitCustomizations}
                className="bg-brand text-white text-xs font-extrabold px-6 py-3.5 rounded-xl hover:bg-brand-dark transition-all shadow-md active:scale-95"
              >
                Add to Cart
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Clock, MapPin, Bike, Search, Percent, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Categories
const categories = [
  { name: 'Pizza', emoji: '🍕', bg: 'from-amber-500/10 to-orange-500/10' },
  { name: 'Burger', emoji: '🍔', bg: 'from-yellow-500/10 to-amber-600/10' },
  { name: 'Biryani', emoji: '🍛', bg: 'from-orange-500/10 to-red-500/10' },
  { name: 'Italian', emoji: '🍝', bg: 'from-green-500/10 to-emerald-500/10' },
  { name: 'Desserts', emoji: '🍰', bg: 'from-pink-500/10 to-rose-500/10' },
  { name: 'Drinks', emoji: '🥤', bg: 'from-sky-500/10 to-indigo-500/10' },
  { name: 'Fast Food', emoji: '🍟', bg: 'from-yellow-400/10 to-orange-500/10' },
];

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('');
  
  // Carousel Banner State
  const [activeBanner, setActiveBanner] = useState(0);
  const banners = [
    {
      title: "50% Off First Order",
      desc: "Order from top-rated restaurants near you",
      code: "EXPRESS50",
      bg: "from-brand via-orange-500 to-rose-500"
    },
    {
      title: "Free Delivery Weekend",
      desc: "Zero delivery fees on orders above ₹199",
      code: "FREEDEL",
      bg: "from-indigo-600 via-purple-600 to-pink-600"
    }
  ];

  // Rotate banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Fetch restaurants based on filters
  useEffect(() => {
    const loadRestaurants = async () => {
      setLoading(true);
      try {
        const data = await api.getRestaurants({
          search: searchParam,
          category: selectedCategory || undefined,
          vegOnly,
          sortBy: sortBy || undefined
        });
        setRestaurants(data);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, [searchParam, selectedCategory, vegOnly, sortBy]);

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null); // clear filter
    } else {
      setSelectedCategory(catName);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCategory(null);
    setVegOnly(false);
    setSortBy('');
    setSearchParams({});
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Promotional Banner Carousel */}
      <div className="relative rounded-3xl overflow-hidden h-44 sm:h-56 shadow-lg shadow-brand/5">
        {banners.map((banner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: activeBanner === index ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-r ${banner.bg} p-6 sm:p-10 flex flex-col justify-between text-white`}
          >
            <div className="max-w-md space-y-2">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Promotional Offer
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {banner.title}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm font-medium">
                {banner.desc}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white/90">Use Code:</span>
              <span className="bg-white text-brand dark:text-brand font-black text-sm px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
                <Percent className="w-4 h-4" /> {banner.code}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. Categories Slider */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
          In the Mood for Something Special?
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all border ${
                selectedCategory === cat.name
                  ? 'border-brand bg-brand/5 scale-105 shadow-md'
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:scale-102 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-3xl mb-1.5">{cat.emoji}</span>
              <span className={`text-xs font-semibold ${selectedCategory === cat.name ? 'text-brand' : 'text-slate-700 dark:text-slate-300'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Filter Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 dark:border-slate-800/80">
        
        {/* Sorting Dropdowns & Quick Selects */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-brand/40"
          >
            <option value="">Sort By: Relevance</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="deliveryTime">Delivery Time (Fastest)</option>
            <option value="distance">Distance (Nearest)</option>
            <option value="deliveryFee">Delivery Fee (Lowest)</option>
          </select>

          {/* Vegetarian Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              vegOnly
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Pure Veg Only
          </button>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory || vegOnly || sortBy || searchParam) && (
          <button
            onClick={handleClearAllFilters}
            className="text-xs text-brand hover:underline font-semibold"
          >
            Clear All Filters
          </button>
        )}
      </section>

      {/* 4. Restaurant Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand" />
            {searchParam ? `Search Results for "${searchParam}"` : selectedCategory ? `${selectedCategory} Restaurants` : 'All Featured Restaurants'}
          </h3>
          <span className="text-xs font-semibold text-slate-400">{restaurants.length} places open</span>
        </div>

        {loading ? (
          // Shimmer Skeleton Loader
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 space-y-4 pb-4">
                <div className="h-44 w-full shimmer"></div>
                <div className="px-4 space-y-2">
                  <div className="h-5 w-2/3 shimmer rounded-md"></div>
                  <div className="h-3 w-full shimmer rounded-md"></div>
                  <div className="flex gap-4">
                    <div className="h-4 w-12 shimmer rounded-md"></div>
                    <div className="h-4 w-12 shimmer rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          // Empty State Illustration
          <div className="text-center py-16 space-y-4">
            <span className="text-6xl">🍽️</span>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">No restaurants match your search</h4>
              <p className="text-slate-400 text-sm">Try broadening your filters or looking up another category.</p>
            </div>
            <button
              onClick={handleClearAllFilters}
              className="bg-brand text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-brand-dark transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          // Restaurant Cards Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <Link
                key={rest.id}
                to={`/restaurant/${rest.id}`}
                className="group flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700/80 transition-all duration-300"
              >
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Delivery Fee Badge */}
                  {rest.deliveryFee === 0 && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Bike className="w-3.5 h-3.5" /> Free Delivery
                    </div>
                  )}
                  {/* Rating Badge overlay */}
                  <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-100 text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 backdrop-blur-sm shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rest.rating}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors">
                      {rest.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {rest.categories.join(', ')} • {rest.description}
                    </p>
                  </div>

                  {/* Badges and Metas */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand/80" />
                      <span>{rest.deliveryTime} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500/80" />
                      <span>{rest.distance} km</span>
                    </div>
                    <div>
                      {rest.deliveryFee > 0 ? `₹${rest.deliveryFee} del fee` : 'Free Delivery'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

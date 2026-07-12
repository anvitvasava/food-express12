import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { Star, Clock, Heart, Trash2 } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { user, toggleFavorite } = useAuth();
  const { showToast } = useToast();
  
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const allRests = await api.getRestaurants();
        const favRests = allRests.filter((r: any) => user.favorites.restaurants.includes(r.id));
        setFavoriteRestaurants(favRests);
      } catch (err) {
        showToast('Failed to load favorites.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [user, showToast]);

  const handleRemoveFavorite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavorite('restaurant', id);
      setFavoriteRestaurants(prev => prev.filter(r => r.id !== id));
      showToast('Removed from favorites', 'success');
    } catch (err) {
      showToast('Failed to remove favorite.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <span className="text-5xl">🔒</span>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Log In Required</h3>
        <p className="text-slate-500 text-sm">Please log in to view your wishlisted restaurants and dishes.</p>
        <Link to="/login" className="inline-block bg-brand text-white text-xs font-bold px-6 py-3 rounded-full">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Favorites
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Saved restaurants you love ordering from</p>
      </div>

      {loading ? (
        <div className="text-center py-20 flex justify-center items-center gap-2 text-xs text-slate-400">
          <span className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full"></span>
          Fetching favorites...
        </div>
      ) : favoriteRestaurants.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <span className="text-5xl">❤️</span>
          <div>
            <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">No favorite places yet</h4>
            <p className="text-xs text-slate-400 mt-0.5">Explore restaurants and tap the heart icon to save them here.</p>
          </div>
          <Link to="/home" className="inline-block bg-brand text-white text-xs font-bold px-6 py-3 rounded-full">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRestaurants.map((rest) => (
            <Link
              key={rest.id}
              to={`/restaurant/${rest.id}`}
              className="group relative flex flex-col rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700/80 transition-all duration-300"
            >
              {/* Image & Favorite Toggle overlay */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={rest.image}
                  alt={rest.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                
                <button
                  onClick={(e) => handleRemoveFavorite(e, rest.id)}
                  className="absolute top-3 right-3 p-2 rounded-full glass text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-850"
                  title="Remove from Favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rest.rating}
                </div>
              </div>

              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors">
                    {rest.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {rest.categories.join(', ')} • {rest.description}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand" /> {rest.deliveryTime} mins</span>
                  <span>₹{rest.deliveryFee > 0 ? `₹${rest.deliveryFee} del fee` : 'Free Delivery'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

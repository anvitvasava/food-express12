import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  Grid, 
  Heart, 
  History, 
  Menu, 
  X,
  Compass,
  ChevronDown
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCity, setActiveCity] = useState('Bardoli, Gujarat');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCitySelect = (city: string) => {
    setActiveCity(city);
    setShowCityDropdown(false);
  };

  const cities = ['Bardoli, Gujarat', 'Surat, Gujarat', 'Ahmedabad, Gujarat', 'Vadodara, Gujarat', 'Rajkot, Gujarat'];

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 glass border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link to="/home" className="flex items-center gap-2 group">
              <span className="text-2xl font-black bg-gradient-to-r from-brand to-rose-500 bg-clip-text text-transparent tracking-tight">
                FoodExpress
              </span>
              <span className="text-xl group-hover:scale-125 transition-transform duration-300">🚀</span>
            </Link>

            {/* City Dropdown */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
              >
                <MapPin className="w-4 h-4 text-brand" />
                <span>{activeCity}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              {showCityDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl glass-premium shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-brand/10 hover:text-brand transition-colors ${
                        activeCity === city ? 'text-brand font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search dishes, restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Link */}
            {user && (
              <Link 
                to="/wishlist" 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-colors text-slate-600 dark:text-slate-300 hidden md:block"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link 
              to="/cart" 
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-colors text-slate-600 dark:text-slate-300 relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white dark:border-[#070a13] animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-xl glass-premium shadow-xl py-2 invisible group-hover:visible hover:visible opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">{user.name}</p>
                  </div>
                  
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-brand/10 hover:text-brand transition-colors">
                    <User className="w-4 h-4" /> Profile Details
                  </Link>

                  <Link to="/profile?tab=history" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-brand/10 hover:text-brand transition-colors">
                    <History className="w-4 h-4" /> Order History
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-brand/10 hover:text-brand transition-colors font-semibold text-indigo-500">
                      <Grid className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}

                  <button 
                    onClick={logout} 
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-md active:scale-95"
              >
                <User className="w-4 h-4" />
                Log In
              </Link>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-colors text-slate-600 dark:text-slate-300 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 2. Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-b border-slate-100 dark:border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-300">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search food, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand/40 text-sm"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* City Selection for Mobile */}
            <div className="flex items-center gap-2 px-1">
              <MapPin className="w-4 h-4 text-brand" />
              <select 
                value={activeCity} 
                onChange={(e) => setActiveCity(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="dark:bg-slate-950">{city}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Link 
                to="/home" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                  isLinkActive('/home') ? 'bg-brand/10 text-brand' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Compass className="w-4 h-4" /> Discover
              </Link>
              
              <Link 
                to="/wishlist" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                  isLinkActive('/wishlist') ? 'bg-brand/10 text-brand' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Heart className="w-4 h-4" /> Wishlist
              </Link>

              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                      location.pathname.startsWith('/profile') ? 'bg-brand/10 text-brand' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>

                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    >
                      <Grid className="w-4 h-4" /> Admin
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 col-span-2 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 bg-brand text-white rounded-xl text-sm font-semibold col-span-2 shadow-md active:scale-95"
                >
                  <User className="w-4 h-4" />
                  Log In / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {children}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#090d16] transition-colors py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold bg-gradient-to-r from-brand to-rose-500 bg-clip-text text-transparent">
              FoodExpress 🚀
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <p className="text-slate-500 dark:text-slate-400">© 2026 FoodExpress Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-slate-500 dark:text-slate-400">
            <Link to="#" className="hover:text-brand transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-brand transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-brand transition-colors">Pricing</Link>
            <Link to="#" className="hover:text-brand transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

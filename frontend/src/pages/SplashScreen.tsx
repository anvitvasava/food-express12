import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Direct user to home page after splash animation
      navigate('/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white select-none">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-4000"></div>

      <div className="text-center space-y-6 z-10">
        
        {/* Animated App Logo Wrapper */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 12,
            duration: 0.8 
          }}
          className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand to-rose-500 shadow-2xl shadow-brand/40 mx-auto"
        >
          <span className="text-5xl animate-bounce">🚀</span>
        </motion.div>

        {/* Brand Text */}
        <div className="space-y-2">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent tracking-tight font-sans"
          >
            FoodExpress
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-slate-400 text-sm font-semibold tracking-widest uppercase"
          >
            Express Delivery • Infinite Taste
          </motion.p>
        </div>

        {/* Loading Spinner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-6"
        >
          <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-brand animate-spin mx-auto"></div>
        </motion.div>
      </div>
    </div>
  );
};

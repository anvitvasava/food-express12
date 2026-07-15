import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { User, Mail, Phone, Lock, MapPin, Chrome } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const Signup: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (!acceptTerms) {
      showToast('You must accept the terms and conditions.', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, phone, password, address);
      showToast('Account created successfully!', 'success');
      navigate('/home');
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (authResult: any) => {
    try {
      if (authResult['code']) {
        setLoading(true);
        await loginWithGoogle(authResult['code']);
        showToast('Registered and logged in with Google successfully!', 'success');
        navigate('/home');
      } else {
        throw new Error('No authorization code returned from Google.');
      }
    } catch (err: any) {
      showToast(err.message || 'Google signup failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      showToast('Google registration failed.', 'error');
    },
    flow: 'auth-code',
  });


  return (
    <div className="max-w-md mx-auto my-6 p-8 rounded-2xl glass-premium shadow-2xl relative overflow-hidden">
      
      {/* Decorative Glows */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand to-rose-500 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Join FoodExpress and order gourmet meals easily
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
              required
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
          <div className="relative">
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
              required
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mobile Number</label>
          <div className="relative">
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
              required
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Default Address</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Flat, building, locality, city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
              required
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="py-1">
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
            <input 
              type="checkbox" 
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 dark:border-slate-800 text-brand focus:ring-brand" 
            />
            <span>I accept the Terms & Conditions and consent to receiving order notifications.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-98 disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Social Logins */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 relative z-10 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Or Sign Up With</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleGoogleGoogleLogin()}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-sm font-semibold transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-50"
          >
            <Chrome className="w-4.5 h-4.5 text-red-500" /> Google
          </button>
          <button
            onClick={() => showToast('Apple login simulation clicked.', 'info')}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-sm font-semibold transition-colors text-slate-700 dark:text-slate-300"
          >
            <span className="text-base">🍎</span> Apple
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
        Already have an account? <Link to="/login" className="text-brand font-semibold hover:underline">Log In</Link>
      </div>

    </div>
  );
};

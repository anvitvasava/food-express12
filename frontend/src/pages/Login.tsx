import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Mail, Lock, Phone, Eye, EyeOff, ShieldCheck, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const { login, loginWithOtp, requestOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP login states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
      navigate('/home');
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      showToast('Please enter your mobile number.', 'error');
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone);
      setOtpSent(true);
      showToast('OTP sent successfully! Enter 123456.', 'success');
    } catch (err: any) {
      showToast('Failed to send OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the verification code.', 'error');
      return;
    }
    setLoading(true);
    try {
      await loginWithOtp(phone, otp);
      showToast('OTP verified. Logged in successfully!', 'success');
      navigate('/home');
    } catch (err: any) {
      showToast('Invalid verification code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMock = (provider: string) => {
    showToast(`${provider} login simulation clicked. Setting up token...`, 'info');
    setTimeout(() => {
      // Simulate quick successful login with mock credentials
      localStorage.setItem('token', 'mock_token_social');
      window.location.href = '/home';
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-2xl glass-premium shadow-2xl relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-brand/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand to-rose-500 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          Discover hot meals delivered right to your doorstep
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6 relative z-10">
        <button
          onClick={() => setLoginMethod('email')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            loginMethod === 'email'
              ? 'bg-white dark:bg-slate-800 text-brand shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Email & Password
        </button>
        <button
          onClick={() => setLoginMethod('phone')}
          className={`py-2 text-xs font-semibold rounded-lg transition-all ${
            loginMethod === 'phone'
              ? 'bg-white dark:bg-slate-800 text-brand shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Mobile Number / OTP
        </button>
      </div>

      {loginMethod === 'email' ? (
        // Email Form
        <form onSubmit={handleEmailSubmit} className="space-y-4 relative z-10">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Password</label>
              <Link to="#" className="text-xs text-brand hover:underline font-semibold">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 dark:border-slate-800 text-brand focus:ring-brand" />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      ) : (
        // Phone OTP Form
        <div className="space-y-4 relative z-10">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm transition-all"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Enter Verification Code</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-2 focus:ring-brand/40 text-sm text-center font-bold tracking-widest transition-all"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Sent to {phone}. <button type="button" onClick={() => setOtpSent(false)} className="text-brand hover:underline font-semibold">Edit phone</button>
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Social Logins */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 relative z-10 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Or Sign In With</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialMock('Google')}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-sm font-semibold transition-colors text-slate-700 dark:text-slate-300"
          >
            <Chrome className="w-4.5 h-4.5 text-red-500" /> Google
          </button>
          <button
            onClick={() => handleSocialMock('Apple')}
            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl text-sm font-semibold transition-colors text-slate-700 dark:text-slate-300"
          >
            <span className="text-base">🍎</span> Apple
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10">
        Don't have an account? <Link to="/signup" className="text-brand font-semibold hover:underline">Sign Up</Link>
      </div>
    </div>
  );
};

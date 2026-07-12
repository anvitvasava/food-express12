import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';

// Component Shell
import { Layout } from './components/Layout';

// Pages
import { SplashScreen } from './pages/SplashScreen';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { RestaurantDetails } from './pages/RestaurantDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderTracking } from './pages/OrderTracking';
import { Profile } from './pages/Profile';
import { Wishlist } from './pages/Wishlist';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* 1. Splash Screen outside layout */}
              <Route path="/" element={<SplashScreen />} />

              {/* 2. Authentication Pages outside main shell (or wrapped inside) */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* 3. Main Customer Ordering Pages wrapped inside Layout */}
              <Route 
                path="/home" 
                element={
                  <Layout>
                    <Home />
                  </Layout>
                } 
              />
              <Route 
                path="/restaurant/:id" 
                element={
                  <Layout>
                    <RestaurantDetails />
                  </Layout>
                } 
              />
              <Route 
                path="/cart" 
                element={
                  <Layout>
                    <Cart />
                  </Layout>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <Layout>
                    <Checkout />
                  </Layout>
                } 
              />
              <Route 
                path="/order-tracking/:id" 
                element={
                  <Layout>
                    <OrderTracking />
                  </Layout>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <Layout>
                    <Profile />
                  </Layout>
                } 
              />
              <Route 
                path="/wishlist" 
                element={
                  <Layout>
                    <Wishlist />
                  </Layout>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <Layout>
                    <Admin />
                  </Layout>
                } 
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

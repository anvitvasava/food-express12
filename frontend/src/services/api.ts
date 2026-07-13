const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

// Simple API wrapper
async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (err: any) {
    console.warn(`[API Fallback] Request to ${path} failed, falling back to mock:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  requestOtp: (phone: string) => request('/auth/otp/request', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  getMe: () => request('/auth/me'),

  // Restaurants
  getRestaurants: (params: { search?: string; category?: string; vegOnly?: boolean; sortBy?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.vegOnly) query.append('vegOnly', String(params.vegOnly));
    if (params.sortBy) query.append('sortBy', params.sortBy);
    
    const queryString = query.toString();
    return request(`/restaurants${queryString ? `?${queryString}` : ''}`);
  },
  getRestaurantById: (id: string) => request(`/restaurants/${id}`),
  toggleFavorite: (type: 'restaurant' | 'dish', id: string) => 
    request('/restaurants/favorite', { method: 'POST', body: JSON.stringify({ type, id }) }),

  // Profile
  updateProfile: (data: any) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addAddress: (data: any) => request('/profile/address', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => request(`/profile/address/${id}`, { method: 'DELETE' }),
  addPaymentMethod: (data: any) => request('/profile/payment-method', { method: 'POST', body: JSON.stringify(data) }),

  // Orders
  createOrder: (data: any) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => request('/orders'),
  getOrderById: (id: string) => request(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => 
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  addRestaurant: (data: any) => request('/admin/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  addMenuItem: (restaurantId: string, data: any) => 
    request(`/admin/restaurants/${restaurantId}/menu`, { method: 'POST', body: JSON.stringify(data) })
};

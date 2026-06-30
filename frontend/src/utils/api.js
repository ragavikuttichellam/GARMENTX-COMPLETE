import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor – attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('manisara_world_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('manisara_world_token');
      localStorage.removeItem('manisara_world_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)        => api.post('/auth/register', data),
  login:    (data)        => api.post('/auth/login', data),
  getProfile: ()          => api.get('/auth/profile'),
  updateProfile: (data)   => api.put('/auth/profile', data),
  changePassword: (data)  => api.put('/auth/change-password', data),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:       (params)  => api.get('/products', { params }),
  getById:      (id)      => api.get(`/products/${id}`),
  getFeatured:  ()        => api.get('/products/featured'),
  getNewArrivals: ()      => api.get('/products/new-arrivals'),
  addReview:    (id, data)=> api.post(`/products/${id}/review`, data),
};

export const reviewAPI = {
  add:        (data) => api.post('/reviews/add', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByProduct: (id, params) => api.get(`/reviews/product/${id}`, { params }),
  update:     (id, data) => api.put(`/reviews/update/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:     (id) => api.delete(`/reviews/delete/${id}`),
  average:    (id) => api.get(`/reviews/average/${id}`),
  helpful:    (id) => api.post(`/reviews/${id}/helpful`),
  report:     (id, data) => api.post(`/reviews/${id}/report`, data),
  adminList:  (params) => api.get('/reviews/admin/all', { params }),
  analytics:  () => api.get('/reviews/admin/analytics'),
  reply:      (id, data) => api.put(`/reviews/reply/${id}`, data),
  moderate:   (id, data) => api.put(`/reviews/moderate/${id}`, data),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:    (data)       => api.post('/orders', data),
  getMyOrders: ()         => api.get('/orders/myorders'),
  getById:   (id)         => api.get(`/orders/${id}`),
  markPaid:  (id, data)   => api.put(`/orders/${id}/pay`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  getKey:         ()          => api.get('/payment/key'),
  createOrder:    (data)      => api.post('/payment/razorpay', data),
  verify:         (data)      => api.post('/payment/verify', data),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:       ()          => api.get('/admin/dashboard'),
  createProduct:      (data)      => api.post('/admin/products', data),
  updateProduct:      (id, data)  => api.put(`/admin/products/${id}`, data),
  deleteProduct:      (id)        => api.delete(`/admin/products/${id}`),
  getAllOrders:       (params)    => api.get('/orders/admin/all', { params }),
  getOrderDetail:     (id)        => api.get(`/orders/admin/${id}`),
  getOrderById:       (id)        => api.get(`/orders/admin/${id}`),
  updateOrderStatus:  (id, data)  => api.put(`/orders/${id}/status`, data),
  getAllUsers:        ()          => api.get('/admin/users'),
  getInvoice:         async (id, inline = false) => {
    const { data } = await api.get(`/admin/orders/${id}/invoice`, {
      params: inline ? { inline: true } : {},
      responseType: 'blob'
    });
    return data;
  },
  getShippingLabel:   async (id, inline = false) => {
    const { data } = await api.get(`/admin/orders/${id}/shipping-label`, {
      params: inline ? { inline: true } : {},
      responseType: 'blob'
    });
    return data;
  },
};

export default api;

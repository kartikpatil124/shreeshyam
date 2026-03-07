import axios from 'axios';

// In production, VITE_API_URL points to the Render backend URL
// In development, the Vite proxy handles routing (baseURL is empty)
const api = axios.create({
    baseURL: import.meta.env.DEV ? '' : 'https://shreeshyam-xiul.onrender.com',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

// ── Auth APIs ──
export const loginAdmin = (email, password) =>
    api.post('/admin/login', { email, password });

export const logoutAdmin = () =>
    api.post('/admin/logout');

export const verifySession = () =>
    api.get('/admin/verify-session');

export const updateCredentials = (payload) =>
    api.put('/admin/update-credentials', payload);

// ── Order APIs ──
export const createOrder = (data) =>
    api.post('/orders/create', data);

export const getPendingOrders = () =>
    api.get('/orders/pending');

export const getCompletedOrders = () =>
    api.get('/orders/completed');

export const searchOrders = (query) =>
    api.get(`/orders/search?query=${query}`);

export const filterOrders = (startDate, endDate) =>
    api.get(`/orders/filter?startDate=${startDate}&endDate=${endDate}`);

export const completeOrder = (id) =>
    api.put(`/orders/complete/${id}`);

export const updateOrder = (id, data) =>
    api.put(`/orders/update/${id}`, data);

export const deleteOrder = (id) =>
    api.delete(`/orders/delete/${id}`);

export const getStatistics = () =>
    api.get('/orders/statistics');

// ── Suggestion APIs ──
export const getProductSuggestions = () =>
    api.get('/suggestions/products');

export const getSizeSuggestions = () =>
    api.get('/suggestions/sizes');

export const getPartySuggestions = () =>
    api.get('/suggestions/parties');

export const addProductSuggestion = (productName) =>
    api.post('/suggestions/add-product', { productName });

export const addSizeSuggestion = (productSize) =>
    api.post('/suggestions/add-size', { productSize });

export const addPartySuggestion = (partyName) =>
    api.post('/suggestions/add-party', { partyName });

export default api;

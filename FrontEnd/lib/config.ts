// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://melody-hub-vhml.onrender.com/api'
  : 'http://localhost:5000/api'

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  FACEBOOK_LOGIN: `${API_BASE_URL}/auth/facebook`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  VERIFY_RESET_CODE: `${API_BASE_URL}/auth/verify-reset-code`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  UPDATE_USER: `${API_BASE_URL}/auth/user`,
  GET_USER_INFO: `${API_BASE_URL}/auth/user`
}

// Product endpoints
export const PRODUCT_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/products`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/products/${id}`,
  GET_BY_CATEGORY: (category: string) => `${API_BASE_URL}/products/category/${category}`
}

// Cart endpoints
export const CART_ENDPOINTS = {
  GET_CART: `${API_BASE_URL}/cart`,
  ADD_TO_CART: `${API_BASE_URL}/cart/add`,
  UPDATE_CART: `${API_BASE_URL}/cart/update`,
  REMOVE_FROM_CART: `${API_BASE_URL}/cart/remove`,
  CLEAR_CART: `${API_BASE_URL}/cart/clear`
}

// Order endpoints
export const ORDER_ENDPOINTS = {
  CREATE_ORDER: `${API_BASE_URL}/orders`,
  GET_ORDERS: `${API_BASE_URL}/orders`,
  GET_ORDER_BY_ID: (id: string) => `${API_BASE_URL}/orders/${id}`,
  UPDATE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/orders/${id}/status`
}
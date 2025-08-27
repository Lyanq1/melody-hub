import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
  return {}
}

export type StatsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'
export type RevenueType = 'daily' | 'monthly' | 'quarterly' | 'yearly'

export interface RecentOrder {
  _id: string
  userId: {
    DisplayName: string
    Email: string
  }
  totalPrice: number
  status: string
  createdAt: string
  paymentStatus: string
}

export const adminStatsService = {
  async getSystemStats() {
    const res = await axios.get(`${API_BASE_URL}/admin/system-stats`, {
      headers: getAuthHeaders()
    })
    return res.data
  },

  async getProductStats() {
    const res = await axios.get(`${API_BASE_URL}/admin/product-stats`, {
      headers: getAuthHeaders()
    })
    return res.data
  },

  async getComprehensiveStats(params: { period?: StatsPeriod } = {}) {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/comprehensive`, {
      headers: getAuthHeaders(),
      params
    })
    return res.data
  },

  async getRevenueStats(params: { type?: RevenueType; year?: number } = {}) {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/revenue`, {
      headers: getAuthHeaders(),
      params
    })
    return res.data
  },

  async getCustomerStats(params: { period?: StatsPeriod } = {}) {
    const res = await axios.get(`${API_BASE_URL}/admin/stats/customers`, {
      headers: getAuthHeaders(),
      params
    })
    return res.data
  },

  async getRecentOrders(limit: number = 5) {
    const res = await axios.get(`${API_BASE_URL}/admin/orders`, {
      headers: getAuthHeaders(),
      params: {
        limit,
        page: 1,
        sort: '-createdAt'
      }
    })
    return res.data.orders as RecentOrder[]
  }
}

export default adminStatsService



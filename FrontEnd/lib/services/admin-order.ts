import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class AdminOrderService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Order Management
  async getAllOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/orders?${queryParams.toString()}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getOrderById(orderId: string) {
    const response = await axios.get(
      `${API_BASE_URL}/admin/orders/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string, note?: string) {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/orders/${orderId}/status`,
      { status, note },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/orders/${orderId}/payment`,
      { paymentStatus },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async deleteOrder(orderId: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/orders/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // Comprehensive Statistics
  async getComprehensiveStats(period: string = 'month') {
    const response = await axios.get(
      `${API_BASE_URL}/admin/stats/comprehensive?period=${period}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getRevenueStats(type: string = 'monthly', year: number = new Date().getFullYear()) {
    const response = await axios.get(
      `${API_BASE_URL}/admin/stats/revenue?type=${type}&year=${year}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getCustomerStats(period: string = 'month') {
    const response = await axios.get(
      `${API_BASE_URL}/admin/stats/customers?period=${period}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export const adminOrderService = new AdminOrderService();

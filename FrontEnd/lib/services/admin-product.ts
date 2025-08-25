import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
};

export const adminProductService = {
  // ==================== PRODUCT MANAGEMENT ====================
  
  // Lấy danh sách tất cả sản phẩm
  async getAllProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        headers: getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Lấy thông tin một sản phẩm cụ thể
  async getProductById(productId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/products/${productId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Tạo sản phẩm mới
  async createProduct(productData: {
    name: string;
    price: string;
    artist: string;
    image?: string;
    categoryId?: string;
    releaseDate?: Date;
    stock?: number;
    country?: string;
    iso2?: string;
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/products`, productData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Cập nhật sản phẩm
  async updateProduct(productId: string, updateData: any) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/products/${productId}`, updateData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Xóa sản phẩm
  async deleteProduct(productId: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Xóa nhiều sản phẩm
  async deleteMultipleProducts(productIds: string[]) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/products/bulk`, {
        headers: getAuthHeaders(),
        data: { productIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple products:', error);
      throw error;
    }
  },

  // ==================== CATEGORY MANAGEMENT ====================
  
  // Lấy danh sách tất cả danh mục
  async getAllCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    parentCategory?: string;
  } = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/categories`, {
        headers: getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy thông tin một danh mục cụ thể
  async getCategoryById(categoryId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Tạo danh mục mới
  async createCategory(categoryData: {
    name: string;
    description?: string;
    parentCategory?: string;
    image?: string;
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/categories`, categoryData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Cập nhật danh mục
  async updateCategory(categoryId: string, updateData: any) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/categories/${categoryId}`, updateData, {
        headers: getAuthHeaders()
      });
      return response.data;
      } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Xóa danh mục
  async deleteCategory(categoryId: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/categories/${categoryId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // ==================== STATISTICS ====================
  
  // Lấy thống kê sản phẩm và danh mục
  async getProductStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/product-stats`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }
};

export default adminProductService;

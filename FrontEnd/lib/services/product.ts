import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Product {
  _id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
  categoryId?: string;
  artistId?: string;
  artist?: string;
  releaseYear?: string;
  stock?: number;
  productCode?: string;
  genre?: string;
  format?: string;
  country?: string;
  recordLabel?: string;
  trackList?: string[];
  isNew?: boolean;
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/product`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await axios.get(`${API_URL}/product/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
};

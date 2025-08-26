import Shipper from '../models/shipping/shipper.model.js';

export class ShipperService {
  async getRandomShipper() {
    try {
      // Lấy random một shipper từ database
      const shipper = await Shipper.aggregate([
        { $sample: { size: 1 } }  // Lấy ngẫu nhiên 1 document
      ]);
      
      return shipper[0];  // Trả về shipper đầu tiên trong mảng kết quả
    } catch (error) {
      console.error('Error getting random shipper:', error);
      throw error;
    }
  }

  async getAllShippers() {
    try {
      return await Shipper.find();
    } catch (error) {
      console.error('Error getting all shippers:', error);
      throw error;
    }
  }
}




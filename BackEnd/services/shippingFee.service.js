import ShippingFee from '../models/shipping/shippingFee.model.js';

export class ShippingFeeService {
  // Lấy phí vận chuyển cho một quận
  async getFeeByDistrict(district) {
    try {
      const shippingFee = await ShippingFee.findOne({
        district: district,
        isActive: true
      });

      if (!shippingFee) {
        // Nếu không tìm thấy, trả về phí mặc định
        return {
          district: district,
          fee: 30000 // Phí mặc định
        };
      }

      return {
        district: shippingFee.district,
        fee: shippingFee.fee
      };
    } catch (error) {
      console.error('Error getting shipping fee:', error);
      throw new Error('Could not get shipping fee');
    }
  }

  // Lấy tất cả phí vận chuyển
  async getAllFees() {
    try {
      const fees = await ShippingFee.find({ isActive: true })
        .select('district fee updatedAt')
        .sort({ district: 1 });
      return fees;
    } catch (error) {
      console.error('Error getting all shipping fees:', error);
      throw new Error('Could not get shipping fees');
    }
  }

  // Cập nhật phí vận chuyển
  async updateFee(district, newFee) {
    try {
      const updatedFee = await ShippingFee.findOneAndUpdate(
        { district: district },
        {
          fee: newFee,
          updatedAt: new Date()
        },
        { new: true, upsert: true } // Tạo mới nếu chưa tồn tại
      );

      return updatedFee;
    } catch (error) {
      console.error('Error updating shipping fee:', error);
      throw new Error('Could not update shipping fee');
    }
  }

  // Xóa phí vận chuyển (soft delete)
  async deleteFee(district) {
    try {
      const result = await ShippingFee.findOneAndUpdate(
        { district: district },
        { isActive: false },
        { new: true }
      );

      if (!result) {
        throw new Error('Shipping fee not found');
      }

      return result;
    } catch (error) {
      console.error('Error deleting shipping fee:', error);
      throw new Error('Could not delete shipping fee');
    }
  }
}

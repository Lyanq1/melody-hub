import DeliveryFee from '../models/shipping/deliveryFee.model.js';

export class DeliveryFeeService {
  async getDeliveryFee(toDistrict) {
    try {
      const fee = await DeliveryFee.findOne({
        toDistrict: toDistrict
      });

      if (!fee) {
        throw new Error('Không tìm thấy phí vận chuyển cho quận/huyện này');
      }

      return fee;
    } catch (error) {
      console.error('Error getting delivery fee:', error);
      throw error;
    }
  }

  async getAllDeliveryFees() {
    try {
      const fees = await DeliveryFee.find()
        .sort({ toDistrict: 1 });
      return fees;
    } catch (error) {
      console.error('Error getting all delivery fees:', error);
      throw error;
    }
  }
}
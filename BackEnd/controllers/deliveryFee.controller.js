import { DeliveryFeeService } from '../services/deliveryFee.service.js';

const deliveryFeeService = new DeliveryFeeService();

// Lấy phí vận chuyển cho một quận
export const getDeliveryFee = async (req, res) => {
  try {
    const { toDistrict } = req.params;

    if (!toDistrict) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp quận/huyện'
      });
    }

    const fee = await deliveryFeeService.getDeliveryFee(toDistrict);

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy tất cả phí vận chuyển
export const getAllDeliveryFees = async (req, res) => {
  try {
    const fees = await deliveryFeeService.getAllDeliveryFees();
    res.json({
      success: true,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
import { ShippingFeeService } from '../services/shippingFee.service.js';

const shippingFeeService = new ShippingFeeService();

// Lấy phí vận chuyển cho một quận
export const getFeeByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    if (!district) {
      return res.status(400).json({
        success: false,
        message: 'District is required'
      });
    }

    const fee = await shippingFeeService.getFeeByDistrict(district);

    res.json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Lấy tất cả phí vận chuyển
export const getAllFees = async (req, res) => {
  try {
    const fees = await shippingFeeService.getAllFees();
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

// Cập nhật phí vận chuyển
export const updateFee = async (req, res) => {
  try {
    const { district } = req.params;
    const { fee } = req.body;

    if (!district || !fee) {
      return res.status(400).json({
        success: false,
        message: 'District and fee are required'
      });
    }

    const updatedFee = await shippingFeeService.updateFee(district, fee);

    res.json({
      success: true,
      data: updatedFee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Xóa phí vận chuyển
export const deleteFee = async (req, res) => {
  try {
    const { district } = req.params;

    if (!district) {
      return res.status(400).json({
        success: false,
        message: 'District is required'
      });
    }

    await shippingFeeService.deleteFee(district);

    res.json({
      success: true,
      message: 'Shipping fee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

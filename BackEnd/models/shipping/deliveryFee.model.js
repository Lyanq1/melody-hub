import mongoose from 'mongoose';

const deliveryFeeSchema = new mongoose.Schema({
  toDistrict: {
    type: String,
    required: true
  },
  fromDistrict: {
    type: String,
    default: 'Phường Chợ Quán'
  },
  deliveryFee: {
    type: Number,
    required: true
  }
}, {
  collection: 'deliveryFees'  // Tên collection trong MongoDB
});

// Đổi tên model thành 'deliveryFees' để khớp với tên collection
const DeliveryFee = mongoose.model('deliveryFees', deliveryFeeSchema);
export default DeliveryFee;
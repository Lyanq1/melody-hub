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

const DeliveryFee = mongoose.model('DeliveryFee', deliveryFeeSchema);
export default DeliveryFee;

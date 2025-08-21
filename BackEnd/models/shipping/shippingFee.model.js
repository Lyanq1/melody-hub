import mongoose from 'mongoose';

const shippingFeeSchema = new mongoose.Schema({
  district: {
    type: String,
    required: true,
    unique: true,  // Mỗi quận chỉ có một mức giá
    trim: true
  },
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'shipping_fees'  // Tên collection trong MongoDB
});

// Tự động cập nhật updatedAt khi có thay đổi
shippingFeeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ShippingFee = mongoose.model('ShippingFee', shippingFeeSchema);
export default ShippingFee;

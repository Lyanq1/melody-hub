import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Types.ObjectId, 
    required: true,
    ref: 'Account'
  },
  items: [{
    discId: mongoose.Types.ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: Number,
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Shipping', 'Delivered'],
    default: 'Confirmed'
  },
  paymentMethod: {
    type: String,
    enum: ['Stripe', 'MoMo', 'Cash on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryTime: {
    type: String,
    required: true
  }
}, {
  collection: 'orders'
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  items: [
    {
      discId: mongoose.Types.ObjectId,
      name: String,
      price: Number, // Changed from String to Number for proper currency handling
      quantity: Number
    }
  ],
  totalPrice: Number,
  shippingAddress: {
    addressLine: String,
    city: String,
    country: String,
    postalCode: Number,
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered'],
    default: 'Confirmed'
  },
  paymentMethod: {
    type: String,
    enum: ['Stripe', 'MoMo', 'Cash on Delivery'], // Removed 'Unknown'
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'orders'
});

const Order = mongoose.model('Order', orderSchema);
export default Order;

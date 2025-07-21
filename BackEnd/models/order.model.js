import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  items: [
    {
      name: String,
      price: String,
      quantity: Number,
      discId: mongoose.Types.ObjectId
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
  createdDate: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'orders'
});

const Order = mongoose.model('Order', orderSchema);
export default Order;

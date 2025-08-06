import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const cartItemSchema = new mongoose.Schema({
  discId: {
    type: ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  }
}, {
  collection: 'cart',
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 
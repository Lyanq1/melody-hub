import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  discId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disc',
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', // Assuming your user model is named 'Account'
    required: true
  },
  items: [cartItemSchema],
  total: {
    type: String,
    default: '0'
  }
}, {
  collection: 'cart',
  timestamps: true
});

// Add index for faster queries
cartSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
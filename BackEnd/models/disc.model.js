import mongoose from 'mongoose';
import { ObjectId } from 'mongodb'
const discSchema = new mongoose.Schema({
  'product-image': String,
  'product-name': String,
  'product-price': String,
}, {
  collection: 'disc' // Đảm bảo dùng collection 'disc'
});

const Disc = mongoose.model('Disc', discSchema);

export default Disc;
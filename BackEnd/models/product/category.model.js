import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  parentCategory: {
    type: ObjectId,
    default: null
  },
  image: {
    type: String,
    default: ""
  }
}, {
  collection: 'categories',
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category; 
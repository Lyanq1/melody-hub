import mongoose from 'mongoose';

const shipperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
}, {
  collection: 'shippers'
});

const Shipper = mongoose.model('Shipper', shipperSchema);
export default Shipper;

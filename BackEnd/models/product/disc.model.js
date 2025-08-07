import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
const discSchema = new mongoose.Schema(
  {
    image: String,
    name: String,
    price: String,
    artist: String,
    categoryId: ObjectId,
    releaseDate: Date,
    stock: Number,
    country: String,
    iso2: String
  },
  {
    collection: 'disc' // Đảm bảo dùng collection 'disc'
  }
)

const Disc = mongoose.model('Disc', discSchema)

export default Disc

import mongoose from 'mongoose';

// Kết nối MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/melody-hub';
mongoose.connect(MONGODB_URI);

// Định nghĩa schema
const deliveryFeeSchema = new mongoose.Schema({
  toDistrict: String,
  fromDistrict: {
    type: String,
    default: 'Phường Chợ Quán'
  },
  deliveryFee: Number
});

const DeliveryFee = mongoose.model('DeliveryFee', deliveryFeeSchema);

// Danh sách các quận với phí ship 10k
const lowFeeDistricts = [
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 6',
  'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10'
];

// Danh sách tất cả các quận/huyện
const allDistricts = [
  // Các quận
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 6',
  'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12',
  'Quận Phú Nhuận', 'Quận Bình Thạnh', 'Quận Gò Vấp',
  'Quận Tân Bình', 'Quận Bình Tân', 'Quận Tân Phú',
  'Quận Thủ Đức',
  // Các huyện
  'Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi',
  'Huyện Cần Giờ', 'Huyện Nhà Bè'
];

// Hàm thêm dữ liệu
const seedDeliveryFees = async () => {
  try {
    // Lấy danh sách các quận đã có trong database
    const existingDistricts = await DeliveryFee.find().distinct('toDistrict');
    console.log('Các quận hiện có:', existingDistricts);
    
    // Lọc ra các quận chưa có trong database
    const missingDistricts = allDistricts.filter(
      district => !existingDistricts.includes(district)
    );

    if (missingDistricts.length === 0) {
      console.log('Tất cả các quận đã có trong database!');
      await mongoose.connection.close();
      return;
    }

    // Tạo dữ liệu cho các quận còn thiếu
    const newDeliveryFees = missingDistricts.map(district => ({
      toDistrict: district,
      fromDistrict: 'Quận 5',
      deliveryFee: lowFeeDistricts.includes(district) ? 10000 : 30000
    }));

    // Thêm vào database
    await DeliveryFee.insertMany(newDeliveryFees);

    console.log(`Đã thêm ${missingDistricts.length} quận/huyện mới:`);
    missingDistricts.forEach(district => {
      const fee = lowFeeDistricts.includes(district) ? '10,000đ' : '30,000đ';
      console.log(`- ${district}: ${fee}`);
    });

  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu:', error);
  } finally {
    // Đóng kết nối database
    await mongoose.connection.close();
  }
};

// Chạy script
seedDeliveryFees();
import mongoose from 'mongoose';

const resetTokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'resetTokens',
  timestamps: { createdAt: 'createdAt', updatedAt: false }
});

// Tạo index để tự động xóa token hết hạn
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Tạo index cho username và token
resetTokenSchema.index({ username: 1 });
resetTokenSchema.index({ token: 1 });

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

// Hàm tạo reset token
export const createResetToken = async (username, email, token, expiresInMinutes = 15) => {
  try {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    // Xóa token cũ nếu có
    await ResetToken.deleteMany({ username });
    
    const resetToken = new ResetToken({
      username,
      email,
      token,
      expiresAt
    });
    
    await resetToken.save();
    return resetToken;
  } catch (error) {
    throw new Error('Error creating reset token: ' + error.message);
  }
};

// Hàm tìm reset token
export const findResetToken = async (token) => {
  try {
    const resetToken = await ResetToken.findOne({ 
      token, 
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    return resetToken;
  } catch (error) {
    throw new Error('Error finding reset token: ' + error.message);
  }
};

// Hàm đánh dấu token đã sử dụng
export const markTokenAsUsed = async (token) => {
  try {
    const resetToken = await ResetToken.findOneAndUpdate(
      { token },
      { isUsed: true },
      { new: true }
    );
    return resetToken;
  } catch (error) {
    throw new Error('Error marking token as used: ' + error.message);
  }
};

// Hàm xóa token theo username
export const deleteResetTokensByUsername = async (username) => {
  try {
    await ResetToken.deleteMany({ username });
  } catch (error) {
    throw new Error('Error deleting reset tokens: ' + error.message);
  }
};

export default ResetToken;
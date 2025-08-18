// account.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the Account schema
const accountSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  Password: {
    type: String,
    required: function() {
      // Password is required only for non-Facebook accounts
      return this.Username && !this.Username.startsWith('fb_');
    }
  },
  Email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  DisplayName: {
    type: String,
    required: true,
    trim: true
  },
  AvatarURL: {
    type: String,
    required: false
  },
  Role: {
    type: String,
    enum: ['Customer', 'Admin'],
    default: 'Customer'
  },
  Phone: {
    type: String,
    required: false
  },
  Address: {
    type: String,
    required: false
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'accounts', // MongoDB collection name
  timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' }
});

// Create indexes for better performance
// accountSchema.index({ Username: 1 });
// accountSchema.index({ Email: 1 });

// Pre-save middleware to hash password
accountSchema.pre('save', async function(next) {
  if (this.isModified('Password') && this.Password) {
    this.Password = await bcrypt.hash(this.Password, 10);
  }
  next();
});

// Instance method to compare password
accountSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.Password);
};

// Create the Account model
const Account = mongoose.model('Account', accountSchema);

// Hàm tạo tài khoản mới
export const createAccount = async (username, password, email, displayName, avatarURL, role = 'Customer', phone = null, address = null) => {
  try {
    const account = new Account({
      Username: username,
      Password: password,
      Email: email,
      DisplayName: displayName,
      AvatarURL: avatarURL,
      Role: role,
      Phone: phone,
      Address: address
    });
    
    const savedAccount = await account.save();
    return savedAccount._id;
  } catch (error) {
    throw new Error('Error creating account: ' + error.message);
  }
};

// Hàm tìm tài khoản theo username
export const findAccountByUsername = async (username) => {
  try {
    const account = await Account.findOne({ Username: username });
    return account;
  } catch (error) {
    throw new Error('Error finding account: ' + error.message);
  }
};

// Hàm tìm tài khoản theo email
export const findAccountByEmail = async (email) => {
  try {
    const account = await Account.findOne({ Email: email });
    return account;
  } catch (error) {
    throw new Error('Error finding account by email: ' + error.message);
  }
};

// Hàm tìm hoặc tạo tài khoản Facebook
export const findOrCreateFacebookAccount = async (facebookId, email, displayName, avatarURL, role) => {
  try {
    const username = `fb_${facebookId}`; // Sử dụng định dạng fb_<facebookId> làm username duy nhất
    let account = await findAccountByUsername(username);

    if (!account) {
      // Tạo tài khoản mới nếu chưa tồn tại
      // Với tài khoản Facebook, không cần password (sử dụng null hoặc giá trị mặc định)
      account = new Account({
        Username: username,
        Password: null, // Facebook accounts don't need password
        Email: email,
        DisplayName: displayName,
        AvatarURL: avatarURL,
        Role: role
      });
      
      await account.save();
    }

    return account._id;
  } catch (error) {
    console.error('Error in findOrCreateFacebookAccount:', error.message);
    throw new Error('Error finding or creating Facebook account: ' + error.message);
  }
};

// Additional helper functions for MongoDB operations

// Hàm cập nhật thông tin tài khoản
export const updateAccount = async (accountId, updateData) => {
  try {
    const account = await Account.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Cập nhật các trường
    Object.assign(account, updateData);
    account.UpdatedAt = new Date();
    
    // Lưu để trigger pre-save middleware (hash password)
    const updatedAccount = await account.save();
    return updatedAccount;
  } catch (error) {
    throw new Error('Error updating account: ' + error.message);
  }
};

// Hàm xóa tài khoản
export const deleteAccount = async (accountId) => {
  try {
    const account = await Account.findByIdAndDelete(accountId);
    return account;
  } catch (error) {
    throw new Error('Error deleting account: ' + error.message);
  }
};

// Hàm lấy tất cả tài khoản (có thể thêm pagination)
export const getAllAccounts = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const accounts = await Account.find()
      .skip(skip)
      .limit(limit)
      .select('-Password'); // Exclude password from results
    return accounts;
  } catch (error) {
    throw new Error('Error getting accounts: ' + error.message);
  }
};

// Hàm tìm tài khoản theo ID
export const findAccountById = async (accountId) => {
  try {
    const account = await Account.findById(accountId);
    return account;
  } catch (error) {
    throw new Error('Error finding account by ID: ' + error.message);
  }
};



// Export the model for direct use if needed
export default Account;

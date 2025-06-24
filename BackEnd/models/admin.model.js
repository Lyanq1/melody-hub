import mongoose from 'mongoose';
import Account from './account.model.js';

export const createAdmin = async (accountID, phone, address) => {
  try {
    // In MongoDB, we just update the existing Account document with additional admin fields
    const updatedAccount = await Account.findByIdAndUpdate(
      accountID,
      { 
        Phone: phone || null, 
        Address: address || null 
      },
      { new: true }
    );
    
    return accountID;
  } catch (error) {
    throw new Error('Error creating admin: ' + error.message);
  }
};

export const getAdminByAccountId = async (accountID) => {
  try {
    const admin = await Account.findOne({ 
      _id: accountID,
      Role: 'Admin'
    });
    return admin;
  } catch (error) {
    throw new Error('Error finding admin: ' + error.message);
  }
};

export const getAllAdmins = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const admins = await Account.find({ Role: 'Admin' })
      .skip(skip)
      .limit(limit)
      .select('-Password');
    return admins;
  } catch (error) {
    throw new Error('Error getting admins: ' + error.message);
  }
};

import mongoose from 'mongoose';
import Account from '../auth/account.model.js';

export const createCustomer = async (accountID, phone, address) => {
  try {
    // In MongoDB, we just update the existing Account document with additional customer fields
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
    throw new Error('Error creating customer: ' + error.message);
  }
};

// Additional customer-specific functions can be added here
export const getCustomerByAccountId = async (accountID) => {
  try {
    const customer = await Account.findOne({ 
      _id: accountID,
      Role: 'Customer'
    });
    return customer;
  } catch (error) {
    throw new Error('Error finding customer: ' + error.message);
  }
};

export const getAllCustomers = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const customers = await Account.find({ Role: 'Customer' })
      .skip(skip)
      .limit(limit)
      .select('-Password');
    return customers;
  } catch (error) {
    throw new Error('Error getting customers: ' + error.message);
  }
};

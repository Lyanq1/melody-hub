import mongoose from 'mongoose';
import Account from './account.model.js';

export const createArtist = async (accountID, phone, address) => {
  try {
    // In MongoDB, we just update the existing Account document with additional artist fields
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
    throw new Error('Error creating artist: ' + error.message);
  }
};

export const getArtists = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    const artists = await Account.find({ Role: 'Artist' })
      .skip(skip)
      .limit(limit)
      .select('-Password');
    return artists;
  } catch (error) {
    throw new Error('Error getting artists: ' + error.message);
  }
};

export const getArtistByAccountId = async (accountID) => {
  try {
    const artist = await Account.findOne({ 
      _id: accountID,
      Role: 'Artist'
    });
    return artist;
  } catch (error) {
    throw new Error('Error finding artist: ' + error.message);
  }
};

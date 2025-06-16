import Disc from '../models/disc.model.js'

export const getAllDiscs = async (req, res) => {
  try {
    const discs = await Disc.find({});
    console.log(discs);
    if (discs.length === 0) {
      return res.status(404).json({ message: 'No discs found' });
    }
    res.json(discs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discs', error: error.message });
  }
};

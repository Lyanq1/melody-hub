import Disc from '../models/disc.model.js'
// nháp comment

export const getAllDiscs = async (req, res) => {
  try {
    const discs = await Disc.find({})
    console.log(discs)
    if (discs.length === 0) {
      return res.status(404).json({ message: 'No discs found' })
    }
    res.json(discs)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error fetching discs', error: error.message })
  }
}

export const getDiscById = async (req, res) => {
  try {
    const { id } = req.params;
    const disc = await Disc.findById(id);
    
    if (!disc) {
      return res.status(404).json({ message: 'Disc not found' });
    }
    
    res.json(disc);
  } catch (error) {
    console.error('Error fetching disc by ID:', error);
    res.status(500).json({ message: 'Error fetching disc', error: error.message });
  }
}

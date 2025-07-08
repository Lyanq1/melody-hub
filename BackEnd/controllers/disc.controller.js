import Disc from '../models/disc.model.js'
// nháp comment

export const getAllDiscs = async (req, res) => {
  try {
    const discs = await Disc.find({}).limit(40)
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

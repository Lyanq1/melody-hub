import { getArtists } from '../models/artist.model.js'

export const getAllArtists = async (req, res) => {
  try {
    const artists = await getArtists()
    res.json(artists)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nghệ sĩ' })
  }
}

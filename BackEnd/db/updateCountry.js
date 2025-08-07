import { MongoClient, ObjectId } from 'mongodb'
import fetch from 'node-fetch'

const uri = ''

const client = new MongoClient(uri)
const dbName = 'Melody-Hub'

async function fetchCountryFromMusicBrainz(artistName) {
  const query = encodeURIComponent(artistName)
  const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${query}&fmt=json`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MelodyHub/1.0 ( huynhquandev@example.com )'
      }
    })
    const data = await res.json()

    // Lấy kết quả khớp chính xác nhất
    const matched = data.artists?.find((a) => a.name.toLowerCase() === artistName.toLowerCase())

    return matched?.area?.name || 'Unknown'
  } catch (err) {
    console.error(`❌ Failed to fetch country for ${artistName}:`, err.message)
    return 'Unknown'
  }
}

async function updateCountries() {
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(dbName)
    const collection = db.collection('disc')

    const discs = await collection.find({}).toArray()

    for (const d of discs) {
      const artistName = d.artist
      if (!artistName || d.country) continue // skip nếu không có artist hoặc đã có country

      const country = await fetchCountryFromMusicBrainz(artistName)

      await collection.updateOne({ _id: new ObjectId(d._id) }, { $set: { country } })

      console.log(`🌍 ${artistName} → ${country}`)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // delay 1s tránh rate limit
    }
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

updateCountries()

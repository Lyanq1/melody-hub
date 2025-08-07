import { MongoClient, ObjectId } from 'mongodb'

const uri = ''

const client = new MongoClient(uri)
const dbName = 'Melody-Hub'

function extractArtist(name) {
  const parts = name?.split(' - ')
  return parts?.[0]?.trim().toUpperCase() || null
}

async function updateArtists() {
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('Melody-Hub')
    const collection = db.collection('disc')

    const discList = await collection.find({}).toArray()

    for (const d of discList) {
      const artistName = extractArtist(d.name)
      if (!artistName) continue

      await collection.updateOne({ _id: new ObjectId(d._id) }, { $set: { artist: artistName } })

      console.log(`🎵 Updated: ${d.name} → artist: ${artistName}`)
    }
  } catch (err) {
    console.error('❌ Error updating artists:', err)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

updateArtists()

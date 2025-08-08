import { MongoClient, ObjectId } from 'mongodb'

// Bảng mapping tên quốc gia/thành phố sang mã ISO2
const countryMapping = {
  // Main countries
  Vietnam: 'VN',
  Germany: 'DE',
  France: 'FR',
  Mexico: 'MX',
  Norway: 'NO',
  'New Zealand': 'NZ',
  'United Kingdom': 'GB',
  'United States': 'US',
  'South Korea': 'KR',
  Ireland: 'IE',
  Sweden: 'SE',
  Israel: 'IL',
  Canada: 'CA',
  'Puerto Rico': 'PR',
  Australia: 'AU',
  Jamaica: 'JM',
  Japan: 'JP',
  Switzerland: 'CH',
  Iceland: 'IS',

  // Cities / Regions mapped to countries
  'Ho Chi Minh': 'VN',
  Hanoi: 'VN',
  'Bắc Giang': 'VN',
  England: 'GB',
  'West Yorkshire': 'GB',
  Reims: 'FR',
  Boston: 'US',
  'Los Angeles': 'US',
  Atlanta: 'US',
  Sydney: 'AU',
  'New South Wales': 'AU',

  // Unknowns thì để rỗng
  Unknown: '',
  null: ''
}

const uri = '' // lấy trong env mongo nha
const client = new MongoClient(uri)
const dbName = 'Melody-Hub'

// Hàm lấy ISO2 từ tên quốc gia/thành phố
function getISO2(countryName) {
  if (!countryName) return null
  const mapped = countryMapping[countryName]
  if (mapped !== undefined) return mapped || null
  const iso2 = countries.getAlpha2Code(countryName, 'en')
  return iso2 || null
}

async function updateISO2() {
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(dbName)
    const collection = db.collection('disc')

    const discList = await collection.find({}).toArray()

    for (const d of discList) {
      const country = d.country?.trim()
      if (!country) continue

      const iso2 = getISO2(country)

      if (!iso2) {
        console.warn(`⚠️ Country not recognized: ${country}`)
        continue
      }

      await collection.updateOne({ _id: new ObjectId(d._id) }, { $set: { iso2 } })

      console.log(`🌍 Updated: ${country} → iso2: ${iso2}`)
    }
  } catch (err) {
    console.error('❌ Error updating iso2:', err)
  } finally {
    await client.close()
    console.log('🔌 Disconnected from MongoDB')
  }
}

updateISO2()

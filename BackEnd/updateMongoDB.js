import { MongoClient, ObjectId } from 'mongodb'

const uri =
  'mongodb+srv://anhquan2004162:melodyhub123@melody-hub.vsg0hab.mongodb.net/Melody-Hub?retryWrites=true&w=majority&appName=Melody-Hub'

const client = new MongoClient(uri)
const dbName = 'Melody-Hub'

// Dữ liệu phân loại theo từ khóa
const categoryRules = [
  {
    _id: '687a5c8eaea60fd849fc0847',
    name: 'CD / DVD',
    keywords: ['đĩa cd', 'cd', 'đĩa dvd', 'dvd']
  },
  {
    _id: '687a5c8eaea60fd849fc0848',
    name: 'Đĩa Than / Vinyl',
    keywords: ['đĩa than']
  },
  {
    _id: '687a5c8eaea60fd849fc0849',
    name: 'Băng Cassette',
    keywords: ['băng cassette']
  },
  {
    _id: '687a5c8eaea60fd849fc084a',
    name: 'Merch',
    keywords: [
      'merch',
      'áo thun',
      'magazine',
      'lanyard',
      'multicolor',
      'book',
      'sách',
      'túi',
      'vòng tay',
      'sổ tay',
      'áp phích',
      'huy hiệu',
      'đĩa usb',
      'thẻ nhớ'
    ]
  },
  {
    _id: '687a5c8eaea60fd849fc084b',
    name: 'Ấn bản có chữ ký',
    keywords: ['chữ ký']
  },
  {
    _id: '687a5c8eaea60fd849fc0844', // fallback: Tất cả
    name: 'Tất cả',
    keywords: []
  }
]

async function updateCategoryIds() {
  try {
    await client.connect()
    const db = client.db(dbName)

    const discs = db.collection('disc')
    const allDiscs = await discs.find().toArray()

    for (const product of allDiscs) {
      const name = product.name?.toLowerCase() || ''
      let matchedRule = null

      // So khớp theo từng danh mục
      for (const rule of categoryRules) {
        if (rule.keywords.some((kw) => name.includes(kw.toLowerCase()))) {
          matchedRule = rule
          break
        }
      }

      // Nếu không trùng từ khóa nào, gán vào "Tất cả"
      if (!matchedRule) {
        matchedRule = categoryRules.find((r) => r.name === 'Tất cả')
      }

      if (matchedRule) {
        await discs.updateOne({ _id: product._id }, { $set: { categoryId: new ObjectId(matchedRule._id) } })
        console.log(`✅ ${product.name} → ${matchedRule.name}`)
      } else {
        console.log(`❌ Không tìm thấy category cho ${product.name}`)
      }
    }

    console.log('🎉 Đã hoàn tất cập nhật categoryId cho toàn bộ sản phẩm!')
  } catch (err) {
    console.error('❌ Lỗi:', err)
  } finally {
    await client.close()
  }
}

updateCategoryIds()

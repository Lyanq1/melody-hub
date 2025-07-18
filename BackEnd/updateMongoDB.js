import { MongoClient, ObjectId } from 'mongodb'

const uri =
  'mongodb+srv://anhquan2004162:melodyhub123@melody-hub.vsg0hab.mongodb.net/Melody-Hub?retryWrites=true&w=majority&appName=Melody-Hub'

const client = new MongoClient(uri)
const dbName = 'Melody-Hub'

const vietnameseRegex = /[ăâêôơưđáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i

// Từ khóa để nhận diện loại sản phẩm
const categoryMap = [
  { keyword: 'vinyl', name: 'Đĩa Than / Vinyl' },
  { keyword: 'đĩa than', name: 'Đĩa Than / Vinyl' },
  { keyword: 'cd', name: 'CD / DVD' },
  { keyword: 'dvd', name: 'CD / DVD' },
  { keyword: 'cassette', name: 'Băng Cassette' },
  { keyword: 'merch', name: 'Merch' },
  { keyword: 'poster', name: 'Merch' },
  { keyword: 'áo', name: 'Merch' },
  { keyword: 'signed', name: 'Ấn bản có chữ ký' },
  { keyword: 'chữ ký', name: 'Ấn bản có chữ ký' }
]

async function updateCategoryIds() {
  try {
    await client.connect()
    const db = client.db(dbName)

    const discs = db.collection('disc')
    const categories = db.collection('categories')

    const allCategories = await categories.find().toArray()
    const allDiscs = await discs.find().toArray()

    for (const product of allDiscs) {
      const name = product.name?.toLowerCase() || ''
      let matchedCategoryName = null

      // Ưu tiên phân loại loại hình sản phẩm trước (CD/DVD, Vinyl...)
      for (const { keyword, name: categoryName } of categoryMap) {
        if (name.includes(keyword)) {
          matchedCategoryName = categoryName
          break
        }
      }

      // Nếu không tìm thấy loại, phân loại theo quốc gia
      if (!matchedCategoryName) {
        matchedCategoryName = vietnameseRegex.test(name) ? 'Nhạc Việt' : 'Nhạc Nước Ngoài'
      }

      const matchedCategory = allCategories.find((c) => c.name === matchedCategoryName)

      if (matchedCategory) {
        await discs.updateOne({ _id: product._id }, { $set: { categoryId: matchedCategory._id.toString() } })
        console.log(`✅ ${product.name} → ${matchedCategoryName}`)
      } else {
        console.log(`❌ Không tìm thấy category "${matchedCategoryName}"`)
      }
    }

    console.log('🎉 Đã hoàn tất cập nhật categoryId cho toàn bộ disc!')
  } catch (err) {
    console.error('❌ Lỗi:', err)
  } finally {
    await client.close()
  }
}

updateCategoryIds()

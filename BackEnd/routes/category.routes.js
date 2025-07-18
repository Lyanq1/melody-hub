import express from 'express'
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getChildCategories
} from '../controllers/category.controller.js'

const router = express.Router()

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

// Get category by ID
router.get('/:id', getCategoryById)

// Create new category
router.post('/', createCategory)

// Update category
router.put('/:id', updateCategory)

// Delete category
router.delete('/:id', deleteCategory)

// Get child categories
router.get('/:id/children', getChildCategories)

export default router

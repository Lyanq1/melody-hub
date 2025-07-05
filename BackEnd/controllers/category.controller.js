import Category from '../models/category.model.js';
import { ObjectId } from 'mongodb';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'No categories found' });
    }
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if parent category exists if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }
    
    const newCategory = new Category({
      name,
      description,
      parentCategory: parentCategory ? new ObjectId(parentCategory) : null,
      image
    });
    
    await newCategory.save();
    
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, parentCategory, image } = req.body;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if parent category exists if provided
    if (parentCategory) {
      // Prevent circular reference (category can't be its own parent)
      if (categoryId === parentCategory) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
      
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }
    
    // Update fields
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.parentCategory = parentCategory ? new ObjectId(parentCategory) : category.parentCategory;
    category.image = image !== undefined ? image : category.image;
    
    await category.save();
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if any categories use this as parent
    const childCategories = await Category.find({ parentCategory: categoryId });
    if (childCategories.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has child categories',
        childCategories
      });
    }
    
    await Category.findByIdAndDelete(categoryId);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

// Get child categories
export const getChildCategories = async (req, res) => {
  try {
    const parentId = req.params.id;
    
    // Check if parent category exists
    const parentCategory = await Category.findById(parentId);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Parent category not found' });
    }
    
    const childCategories = await Category.find({ parentCategory: parentId });
    
    res.json(childCategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching child categories', error: error.message });
  }
}; 
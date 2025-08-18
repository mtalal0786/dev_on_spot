import Category from '../models/Category.js';

/**
 * @description Creates a new category.
 * @route POST /api/categories
 * @access Public
 */
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    // Handle duplicate key error (if a category with the same name already exists)
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @description Gets all categories.
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @description Updates an existing category by ID.
 * @route PUT /api/categories/:id
 * @access Public
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate that a name is provided
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Find the category and update it
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators: true` ensures validation is run on the update
    );

    // If no category is found, return a 404 error
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @description Deletes a category by ID.
 * @route DELETE /api/categories/:id
 * @access Public
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category and delete it
    const deletedCategory = await Category.findByIdAndDelete(id);

    // If no category is found, return a 404 error
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

import Category from '../models/Category.js';

// Create Category
export const createCategory = async (req, res, next) => {
    try {
        const { name, description, image } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists',
            });
        }

        const category = await Category.create({
            name,
            description,
            image,
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category,
        });
    } catch (error) {
        next(error);
    }
};

// Get All Categories
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        next(error);
    }
};

// Get Category by ID
export const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        next(error);
    }
};

// Update Category
export const updateCategory = async (req, res, next) => {
    try {
        const { name, description, image } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, image },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            category,
        });
    } catch (error) {
        next(error);
    }
};

// Delete Category
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

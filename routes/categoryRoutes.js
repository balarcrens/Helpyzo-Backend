import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// Validation rules
const categoryValidation = [
    body('name').notEmpty().withMessage('Category name is required'),
];

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (Superadmin only)
router.post('/', authenticate, authorize('superadmin'), categoryValidation, handleValidationErrors, createCategory);
router.put('/:id', authenticate, authorize('superadmin'), categoryValidation, handleValidationErrors, updateCategory);
router.delete('/:id', authenticate, authorize('superadmin'), deleteCategory);

export default router;

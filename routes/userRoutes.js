import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllUsers,
    deleteUser,
    ChangeRole,
    updateServiceApprovalStatus,
} from '../controllers/userController.js';

const router = express.Router();

// Validation rules
const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const updateValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
];

// Public routes
router.post('/register', registerValidation, handleValidationErrors, registerUser);
router.post('/login', loginValidation, handleValidationErrors, loginUser);

// Protected routes
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateValidation, handleValidationErrors, updateUserProfile);
router.put('/change-password', authenticate, changePassword);

// Superadmin routes
router.get('/all', authenticate, authorize('superadmin'), getAllUsers);
router.delete('/:id', authenticate, authorize('superadmin'), deleteUser);
router.put('/service-approval/:partnerId/:serviceId', authenticate, authorize('superadmin'), updateServiceApprovalStatus);
router.put('/change-role/:id/:role', authenticate, authorize('superadmin'), ChangeRole);

export default router;

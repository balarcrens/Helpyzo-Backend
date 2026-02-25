import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { createContact, getAllContact, getContactById, deleteContact } from '../controllers/contactController.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const contactValidation = [
    body('fullName').notEmpty().withMessage('fullName is required'),
    body('email').notEmpty().isEmail().withMessage('email is required'),
];

// Public Route
router.post('/', authenticate, contactValidation, handleValidationErrors, createContact);

// Superadmin Route
router.get('/all', authenticate, authorize('superadmin'), getAllContact);
router.get('/:id', authenticate, authorize('superadmin'), getContactById);
router.delete('/:id', authenticate, authorize('superadmin'), deleteContact);

export default router;
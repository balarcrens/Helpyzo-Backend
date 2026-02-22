import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    registerPartner,
    loginPartner,
    getPartnerProfile,
    updatePartnerProfile,
    addService,
    updateService,
    deleteService,
    getAllPartners,
    getPartnerById,
    deletePartner,
    updateDocumentStatus,
    getApprovedServices,
} from '../controllers/partnerController.js';

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

const serviceValidation = [
    body('name').notEmpty().withMessage('Service name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('basePrice').if(body('basePrice').exists()).isNumeric().withMessage('Base price must be a number'),
];

// Public routes
router.post('/register', registerValidation, handleValidationErrors, registerPartner);
router.post('/login', loginValidation, handleValidationErrors, loginPartner);

// Protected routes (Partner only)
router.get('/profile', authenticate, getPartnerProfile);
router.put('/profile', authenticate, updatePartnerProfile);

// Public routes with :id
router.get('/', getAllPartners);
router.get('/approvedservices', getApprovedServices);
router.get('/:id', getPartnerById);

// Service management routes
router.post('/service', authenticate, serviceValidation, handleValidationErrors, addService);
router.put('/service/:serviceId', authenticate, updateService);
router.delete('/service/:serviceId', authenticate, deleteService);

// Superadmin routes
router.delete('/:id', authenticate, authorize('superadmin'), deletePartner);
router.patch('/:partnerId/documents/:docId', authenticate, authorize('superadmin'), updateDocumentStatus);

export default router;
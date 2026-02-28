import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    updateBookingStatus,
    getUserBookings,
    getPartnerBookings,
    deleteBooking,
    rateBooking,
    updateBookingPaymentStatus,
    getPartnerReviews,
} from '../controllers/bookingController.js';

const router = express.Router();

// Validation rules
const bookingValidation = [
    body('partner').notEmpty().withMessage('Partner is required'),
    body('paymentMethod').isIn(['cash', 'card', 'online']).withMessage('Invalid payment method'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
];

// Protected routes
router.post('/', authenticate, bookingValidation, handleValidationErrors, createBooking);
router.get('/', authenticate, getAllBookings);

// Dynamic routes BEFORE :id routes (important for routing order)
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/partner/:partnerId/bookings', authenticate, getPartnerBookings);
router.get('/partner/:partnerId/reviews', getPartnerReviews);

router.get('/:id', authenticate, getBookingById);
router.put('/:id', authenticate, updateBooking);
router.put('/:id/status', authenticate, updateBookingStatus);
router.put('/:id/rate', authenticate, rateBooking);
router.delete('/:id', authenticate, deleteBooking);
router.put('/payment-status/:id', authenticate, authorize('partner'), updateBookingPaymentStatus)

export default router;

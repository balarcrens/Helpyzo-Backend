import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

export default router;

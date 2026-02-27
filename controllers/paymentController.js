import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import { config } from '../config/env.js';

// Initialize Razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.VITE_RAZORPAY_SECRET_KEY || 'dummy_secret',
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public (or Private depending on your setup)
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Amount should be in the smallest currency unit (e.g., paise for INR)
    const options = {
      amount: amount * 100,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: 'Some error occurred while creating order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Public (or Private)
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const key_secret = process.env.VITE_RAZORPAY_SECRET_KEY || 'dummy_secret';

    // Create signature to verify
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful, update the booking status securely
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'paid' });
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

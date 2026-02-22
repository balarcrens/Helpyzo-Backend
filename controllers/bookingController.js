import Booking from '../models/Booking.js';
import Partner from '../models/Partner.js';

// Create Booking
export const createBooking = async (req, res, next) => {
    try {
        const { serviceId, partner, status, notes, paymentMethod, amount, bookedDate, scheduledTime, serviceName, userAddress, categoryId, durationMinutes, bookingNumber } = req.body;

        const booking = await Booking.create({
            serviceId,
            partner,
            user: req.user.id,
            status: status || 'pending',
            notes,
            paymentMethod,
            amount,
            bookedDate,
            scheduledTime,
            serviceName,
            userAddress,
            categoryId,
            durationMinutes,
            bookingNumber
        });

        await Partner.updateOne(
            {
                _id: partner,
                "services._id": serviceId
            },
            {
                $inc: {
                    "services.$.totalBookings": 1
                }
            }
        );

        await booking.populate('partner');
        await booking.populate('user');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// Get All Bookings (with filters)
export const getAllBookings = async (req, res, next) => {
    try {
        const { status, partnerId, userId } = req.query;

        let filter = {};

        if (status) {
            filter.status = status;
        }

        if (partnerId) {
            filter.partner = partnerId;
        }

        if (userId) {
            filter.user = userId;
        }

        const bookings = await Booking.find(filter).populate('partner').populate('user').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get Booking by ID
export const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('partner').populate('user');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// Update Booking
export const updateBooking = async (req, res, next) => {
    try {
        const { status, notes, paymentMethod, scheduledTime, serviceName, userAddress } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, notes, paymentMethod, scheduledTime, serviceName, userAddress },
            { new: true, runValidators: true }
        ).populate('partner').populate('user');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// Update Booking Status
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const updateData = { status };
        if (status === 'completed') {
            updateData.completedAt = new Date();
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('partner').populate('user');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// Get User Bookings
export const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('partner').populate('user').sort({ createdAt: -1 });;

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Get Partner Bookings
export const getPartnerBookings = async (req, res, next) => {
    try {
        const { partnerId } = req.params;

        if (!partnerId) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing partnerId",
            });
        }

        const bookings = await Booking.find({ partner: partnerId })
            .populate("partner", "name phone business")
            .populate("user", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        next(error);
    }
};

// Delete Booking
export const deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Add Rating and Review
export const rateBooking = async (req, res, next) => {
    try {
        const { rating, review } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5',
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { rating, review, completedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('partner').populate('user');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Update partner's rating
        const Partner = require('../models/Partner.js').default;
        const completedBookings = await Booking.countDocuments({
            partner: booking.partner._id,
            status: 'completed',
        });

        const totalRating = await Booking.aggregate([
            { $match: { partner: booking.partner._id, rating: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);

        await Partner.findByIdAndUpdate(booking.partner._id, {
            completedBookings,
            rating: totalRating[0]?.avgRating || 0,
            totalRatings: await Booking.countDocuments({ partner: booking.partner._id, rating: { $exists: true } }),
        });

        res.status(200).json({
            success: true,
            message: 'Rating added successfully',
            booking,
        });
    } catch (error) {
        next(error);
    }
};

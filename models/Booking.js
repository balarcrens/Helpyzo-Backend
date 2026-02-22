import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        bookingNumber: {
            type: String,
            unique: true,
            required: true,
        },

        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner',
            required: true,
        },

        serviceName: {
            type: String,
            required: true,
            trim: true,
        },

        partner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner',
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
            default: 'pending',
            index: true,
        },

        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'online'],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        bookedDate: {
            type: Date,
            required: true,
        },

        scheduledTime: {
            type: String,
            required: true,
        },

        completedAt: Date,

        cancelledAt: Date,

        cancellationReason: {
            type: String,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
        },

        review: {
            type: String,
            trim: true,
            maxlength: 1000,
        },

        userAddress: {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                default: 'India',
            },
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        durationMinutes: {
            type: Number,
            required: true,
        },
        serviceImage: {
            type: String,
        },
        actualCompletedTime: String,
        rescheduleCount: {
            type: Number,
            default: 0,
        },

        createdBy: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
    this.populate('partner', 'name phone email')
        .populate('user', 'name phone email')
        .populate('serviceId', 'name price');
    next();
});

export default mongoose.model('Booking', bookingSchema);

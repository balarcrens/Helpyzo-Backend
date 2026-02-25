import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const partnerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide partner name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide email'],
            unique: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        },
        role: {
            default: 'partner',
            type: String,
        },
        phone: {
            type: String,
            required: [true, 'Please provide phone number'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        address: {
            street: {
                type: String,
                trim: true,
            },
            landmark: {
                type: String,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            pincode: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
            },
        },
        business: {
            name: {
                type: String,
                trim: true,
            },
            yearsOfExperience: {
                type: String,
                trim: true,
                default: "0"
            },
            servicestype: [
                {
                    category: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Category',
                    },
                }
            ]
        },
        services: [
            {
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    auto: true,
                },
                name: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 100,
                },
                category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Category',
                    required: true,
                },
                description: {
                    type: String,
                    trim: true,
                    maxlength: 500,
                },
                image: {
                    type: String,
                },
                basePrice: {
                    type: Number,
                    min: 0,
                },
                visitingFees: {
                    type: Number,
                    default: 0,
                    min: 0,
                },
                discount: {
                    type: Number,
                    default: 0, // percentage (0–100)
                    min: 0,
                    max: 100,
                },
                finalPrice: {
                    type: Number,
                    min: 0,
                },
                durationInMinutes: {
                    type: Number,
                    min: 15,
                },
                isActive: {
                    type: Boolean,
                    default: true,
                },
                approvalStatus: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: {
                    type: String,
                    trim: true,
                },
                availableDays: [
                    {
                        type: String,
                        enum: [
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                            'Sunday',
                        ],
                    },
                ],
                availableTime: {
                    from: {
                        type: String, // "00:00"
                    },
                    to: {
                        type: String, // "00:00"
                    },
                },
                maxBookingsPerDay: {
                    type: Number,
                    default: 10,
                },
                serviceArea: {
                    cities: [String],
                    radiusKm: {
                        type: Number,
                        default: 10,
                    },
                },
                rating: {
                    type: Number,
                    default: 0,
                    min: 0,
                    max: 5,
                },
                totalRatings: {
                    type: Number,
                    default: 0,
                },
                totalBookings: {
                    type: Number,
                    default: 0,
                },
                cancellationAllowed: {
                    type: Boolean,
                    default: true,
                },
                cancellationWindowHours: {
                    type: Number,
                    default: 2,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        workingHours: {
            days: [
                {
                    type: String,
                    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                },
            ],
            fromTime: {
                type: String, // e.g., "09:00"
            },
            toTime: {
                type: String, // e.g., "18:00"
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        paymentMethods: [
            {
                type: String,
                enum: ['cash', 'card', 'online'],
            },
        ],
        profileImage: {
            type: String, // Data URL format
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalRatings: {
            type: Number,
            default: 0,
        },
        completedBookings: {
            type: Number,
            default: 0,
        },
        verification: {
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending',
            },
            verifiedAt: {
                type: Date,
            },
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            rejectionReason: {
                type: String,
                trim: true,
            },
        },
        documents: [
            {
                type: {
                    type: String,
                    enum: ['aadhaar', 'pan', 'gst', 'license', 'certificate', 'other'],
                    required: true,
                },
                fileUrl: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                rejectionReason: {
                    type: String,
                    trim: true,
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        lastLogin: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Hash password before saving
partnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
partnerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
partnerSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

export default mongoose.model('Partner', partnerSchema);

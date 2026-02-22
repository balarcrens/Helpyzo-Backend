import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        sender: {
            model: {
                type: String,
                enum: ['User', 'Partner'],
                required: true,
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'sender.model',
                required: true,
            },
        },

        receiver: {
            model: {
                type: String,
                enum: ['User', 'Partner'],
                required: true,
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'receiver.model',
                required: true,
            },
        },

        type: {
            type: String,
            enum: ['document', 'verification', 'message', 'system'],
            default: 'system',
        },

        relatedPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Partner',
        },

        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
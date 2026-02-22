import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res, next) => {
    try {
        const receiverModel =
            req.user.role === 'partner' ? 'Partner' : 'User';

        const notifications = await Notification.find({
            'receiver.model': receiverModel,
            'receiver.userId': req.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        const receiverModel =
            req.user.role === 'partner' ? 'Partner' : 'User';

        await Notification.updateMany(
            {
                'receiver.model': receiverModel,
                'receiver.userId': req.user.id,
                isRead: false,
            },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        next(error);
    }
};

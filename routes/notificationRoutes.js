import express from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', authenticate, authorize('client', 'partner', 'superadmin'), getMyNotifications);

router.patch('/:id/read', authenticate, authorize('client', 'partner', 'superadmin'),
    param('id').isMongoId().withMessage('Invalid notification id'),
    handleValidationErrors,
    markAsRead
);

router.patch('/readall', authenticate, authorize('client', 'partner', 'superadmin'), markAllAsRead);

router.delete('/:id', authenticate, authorize('client', 'partner', 'superadmin'),
    param('id').isMongoId().withMessage('Invalid notification id'),
    handleValidationErrors,
    deleteNotification
);

export default router;

import { Router } from 'express';
import {
    getNotificationsController,
    markNotificationAsReadController,
    markAllAsReadController,
    deleteNotificationController
} from './notification.controller';
import { authenticate } from '../../middlewares';

const router = Router();

/**
 * @route GET /api/notifications
 * @desc Get all notifications for the authenticated user
 * @access Private
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20)
 * @query status - Filter by status (UNREAD, READ, ARCHIVED)
 */
router.get('/', authenticate, getNotificationsController);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark a specific notification as read
 * @access Private
 */
router.put('/:id/read', authenticate, markNotificationAsReadController);

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read for the authenticated user
 * @access Private
 */
router.put('/read-all', authenticate, markAllAsReadController);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a specific notification
 * @access Private
 */
router.delete('/:id', authenticate, deleteNotificationController);

export default {
    path: "/notifications",
    router: router
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const middlewares_1 = require("../../middlewares");
const router = (0, express_1.Router)();
/**
 * @route GET /api/notifications
 * @desc Get all notifications for the authenticated user
 * @access Private
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 20)
 * @query status - Filter by status (UNREAD, READ, ARCHIVED)
 */
router.get('/', middlewares_1.authenticate, notification_controller_1.getNotificationsController);
/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark a specific notification as read
 * @access Private
 */
router.put('/:id/read', middlewares_1.authenticate, notification_controller_1.markNotificationAsReadController);
/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read for the authenticated user
 * @access Private
 */
router.put('/read-all', middlewares_1.authenticate, notification_controller_1.markAllAsReadController);
/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a specific notification
 * @access Private
 */
router.delete('/:id', middlewares_1.authenticate, notification_controller_1.deleteNotificationController);
exports.default = {
    path: "/notifications",
    router: router
};

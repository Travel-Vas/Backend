"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getNotificationsForUser = exports.createNotificationForUser = exports.createNotificationForAdmins = void 0;
const notification_model_1 = require("./notification.model");
const user_model_1 = __importDefault(require("../users/user.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const constants_1 = require("../../helpers/constants");
const createNotificationForAdmins = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield user_model_1.default.find({ role: constants_1.UserRole.ADMIN }).select('_id');
        if (admins.length === 0) {
            console.warn('No admin users found to send notifications');
            return;
        }
        const notifications = admins.map(admin => ({
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId,
            tripId: data.tripId,
            bookingId: data.bookingId,
            recipientId: admin._id,
            recipientRole: constants_1.UserRole.ADMIN,
            status: notification_model_1.NotificationStatus.UNREAD,
            metadata: data.metadata
        }));
        yield notification_model_1.Notification.insertMany(notifications);
    }
    catch (error) {
        console.error('Error creating notifications for admins:', error);
        throw new App_1.CustomError({
            message: 'Failed to create notifications',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.createNotificationForAdmins = createNotificationForAdmins;
const createNotificationForUser = (recipientId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(recipientId);
        if (!user) {
            throw new App_1.CustomError({
                message: 'Recipient user not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const notification = new notification_model_1.Notification({
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId,
            tripId: data.tripId,
            bookingId: data.bookingId,
            recipientId: recipientId,
            recipientRole: user.role,
            status: notification_model_1.NotificationStatus.UNREAD,
            metadata: data.metadata
        });
        return yield notification.save();
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to create notification',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.createNotificationForUser = createNotificationForUser;
const getNotificationsForUser = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, page = 1, limit = 20, status) {
    try {
        const skip = (page - 1) * limit;
        const query = { recipientId: userId };
        if (status) {
            query.status = status;
        }
        const notifications = yield notification_model_1.Notification.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('tripId', 'name destination')
            .populate('bookingId', 'name destination')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = yield notification_model_1.Notification.countDocuments(query);
        const unreadCount = yield notification_model_1.Notification.countDocuments({
            recipientId: userId,
            status: notification_model_1.NotificationStatus.UNREAD
        });
        const pages = Math.ceil(total / limit);
        return { notifications, total, pages, unreadCount };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch notifications',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getNotificationsForUser = getNotificationsForUser;
const markNotificationAsRead = (notificationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notification_model_1.Notification.findOneAndUpdate({
            _id: notificationId,
            recipientId: userId
        }, {
            status: notification_model_1.NotificationStatus.READ,
            readAt: new Date()
        }, { new: true });
        if (!notification) {
            throw new App_1.CustomError({
                message: 'Notification not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        return notification;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to mark notification as read',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield notification_model_1.Notification.updateMany({
            recipientId: userId,
            status: notification_model_1.NotificationStatus.UNREAD
        }, {
            status: notification_model_1.NotificationStatus.READ,
            readAt: new Date()
        });
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to mark all notifications as read',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteNotification = (notificationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield notification_model_1.Notification.deleteOne({
            _id: notificationId,
            recipientId: userId
        });
        if (result.deletedCount === 0) {
            throw new App_1.CustomError({
                message: 'Notification not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to delete notification',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.deleteNotification = deleteNotification;

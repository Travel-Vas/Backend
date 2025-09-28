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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationController = exports.markAllAsReadController = exports.markNotificationAsReadController = exports.getNotificationsController = void 0;
const http_status_codes_1 = require("http-status-codes");
const notification_service_1 = require("./notification.service");
const getNotificationsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const userId = req['user']._id;
    const result = yield (0, notification_service_1.getNotificationsForUser)(userId, page, limit, status);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Notifications fetched successfully",
        data: result,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getNotificationsController = getNotificationsController;
const markNotificationAsReadController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req['user']._id;
    const notification = yield (0, notification_service_1.markNotificationAsRead)(id, userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Notification marked as read",
        data: notification,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.markNotificationAsReadController = markNotificationAsReadController;
const markAllAsReadController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    yield (0, notification_service_1.markAllNotificationsAsRead)(userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "All notifications marked as read",
        data: null,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.markAllAsReadController = markAllAsReadController;
const deleteNotificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const userId = req['user']._id;
    yield (0, notification_service_1.deleteNotification)(id, userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Notification deleted successfully",
        data: null,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.deleteNotificationController = deleteNotificationController;

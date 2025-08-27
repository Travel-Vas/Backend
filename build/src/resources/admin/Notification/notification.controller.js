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
exports.getNotification = exports.GetNotifications = exports.NotificationController = void 0;
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const notification_service_1 = require("./notification.service");
const NotificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        title: req.body.title,
        message: req.body.message,
        delivery_channel: req.body.delivery_channel,
        audience: req.body.audience,
        schedule_date: req.body.schedule_date,
        schedule_time: req.body.schedule_time,
    };
    if (!payload.title || !payload.message || !payload.delivery_channel || !payload.audience) {
        throw new App_1.CustomError({
            message: "Fields are required",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const response = yield (0, notification_service_1.NotificationService)(payload);
    res.json({
        msg: "Notification created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.NotificationController = NotificationController;
const GetNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, notification_service_1.GetNotificationsService)(userId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.GetNotifications = GetNotifications;
const getNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const id = req.params.id;
    const response = yield (0, notification_service_1.GetNotificationService)(userId, id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getNotification = getNotification;

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
exports.flagAllNotifications = exports.flagNotificationController = exports.getNotificationController = exports.notificationController = void 0;
// routes/notification.ts
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const notification_service_1 = require("./notification.service");
const router = express_1.default.Router();
// Push a notification (Create notification)
const notificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { operationName, message } = req.body;
    const newNotification = {
        userId: req.user._id,
        operationName,
        message,
    };
    const newNotifications = yield (0, notification_service_1._notificationService)(newNotification);
    res.json({
        msg: "notification created successfully",
        data: newNotifications,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
    });
});
exports.notificationController = notificationController;
const getNotificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const response = yield (0, notification_service_1._getNoticationService)(userId);
    res.json({
        msg: "Data Retrieved",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.getNotificationController = getNotificationController;
const flagNotificationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const noficationId = req.params.id;
    const response = yield (0, notification_service_1._flagNotificationService)(noficationId);
    res.json({
        msg: "notification viewed",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.flagNotificationController = flagNotificationController;
const flagAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, notification_service_1._flagAllNotifications)();
    res.json({
        msg: "notification cleared",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.flagAllNotifications = flagAllNotifications;

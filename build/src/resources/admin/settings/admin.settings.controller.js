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
exports.Notifications = exports.NotificationController = void 0;
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const admin_settings_service_1 = require("./admin.settings.service");
const NotificationController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        name: req.body.name,
        language: req.body.languages,
        notifications: req.body.notifications,
    };
    if (!payload.name || !payload.language) {
        throw new App_1.CustomError({
            message: 'Fields required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const response = yield (0, admin_settings_service_1.NotificationService)(payload);
    res.json({
        msg: "Notification created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.NotificationController = NotificationController;
const Notifications = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, admin_settings_service_1.NotificationsService)(userId);
    res.json({
        msg: "Notifications retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.Notifications = Notifications;

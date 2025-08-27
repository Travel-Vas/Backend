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
exports._flagAllNotifications = exports._flagNotificationService = exports._getNoticationService = exports._notificationService = void 0;
const App_1 = require("../../helpers/lib/App");
const notifiction_model_1 = require("./notifiction.model");
const _notificationService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = new notifiction_model_1.Notification(payload);
        yield response.save();
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "something went wrong",
            code: 500,
            ctx: { data: "error saving notification" },
        });
    }
});
exports._notificationService = _notificationService;
const _getNoticationService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield notifiction_model_1.Notification.find({ isViewed: false })
            .sort({ createdAt: -1 })
            .exec();
        return response;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "something went wrong",
            code: 500,
            ctx: { data: "error fetching notification" },
        });
    }
});
exports._getNoticationService = _getNoticationService;
const _flagNotificationService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedNotification = yield notifiction_model_1.Notification.findByIdAndUpdate(id, { isViewed: true }, { new: true });
        if (!updatedNotification) {
            throw new App_1.CustomError({
                message: "notification not found",
                code: 404,
            });
        }
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "something went wrong",
            code: 500,
            ctx: { data: "error flagging notification" },
        });
    }
});
exports._flagNotificationService = _flagNotificationService;
const _flagAllNotifications = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield notifiction_model_1.Notification.updateMany({ isViewed: false }, // Update only those that are not viewed
        { $set: { isViewed: true } }, // Set isViewed to true
        { new: true } // This option is ignored for updateMany
        );
        if (result.matchedCount === 0) {
            throw new App_1.CustomError({
                message: "No notifications found to update",
                code: 404,
            });
        }
        return result; // Optionally return the result of the update
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Something went wrong",
            code: 500,
            ctx: { data: "error flagging notifications" },
        });
    }
});
exports._flagAllNotifications = _flagAllNotifications;

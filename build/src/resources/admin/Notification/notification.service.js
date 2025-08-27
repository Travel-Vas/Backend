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
exports.GetNotificationService = exports.GetNotificationsService = exports.NotificationService = void 0;
const App_1 = require("../../../helpers/lib/App");
const notification_model_1 = __importDefault(require("./notification.model"));
const NotificationService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield notification_model_1.default.create(payload);
        return response;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message,
            code: error.code
        });
    }
});
exports.NotificationService = NotificationService;
const GetNotificationsService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield notification_model_1.default.find({
        userId: id
    }).lean().exec();
    return response;
});
exports.GetNotificationsService = GetNotificationsService;
const GetNotificationService = (userId, id) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield notification_model_1.default.findOne({
        _id: id,
        userId: userId
    }).lean().exec();
    return response;
});
exports.GetNotificationService = GetNotificationService;

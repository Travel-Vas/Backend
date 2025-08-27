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
exports.NotificationsService = exports.NotificationService = void 0;
const App_1 = require("../../../helpers/lib/App");
const admin_settings_model_1 = __importDefault(require("./admin.settings.model"));
const http_status_codes_1 = require("http-status-codes");
const NotificationService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield admin_settings_model_1.default.create(payload);
        return response;
    }
    catch (err) {
        console.log(err);
        throw new App_1.CustomError({
            message: err.message || 'Error creating notification',
            code: err.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.NotificationService = NotificationService;
const NotificationsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield admin_settings_model_1.default.findOne({
        userId: userId
    });
    return response;
});
exports.NotificationsService = NotificationsService;

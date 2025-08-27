"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../../middlewares");
const admin_settings_controller_1 = require("./admin.settings.controller");
const router = express_1.default.Router();
router.post('/', middlewares_1.authenticate, admin_settings_controller_1.NotificationController);
router.get('/notification-setup', middlewares_1.authenticate, admin_settings_controller_1.Notifications);
exports.default = {
    path: "/admin/settings",
    router: router
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../middlewares");
const notification_controller_1 = require("./notification.controller");
const router = express_1.default.Router();
router.post("/create", middlewares_1.authenticate, notification_controller_1.notificationController);
router.get("/", middlewares_1.authenticate, notification_controller_1.getNotificationController);
router.patch("/viewed/:id", middlewares_1.authenticate, notification_controller_1.flagNotificationController);
router.get("/empty", middlewares_1.authenticate, notification_controller_1.flagAllNotifications);
exports.default = {
    path: "/notification",
    router: router,
};

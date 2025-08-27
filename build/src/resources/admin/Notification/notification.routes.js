"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../../middlewares");
const notification_controller_1 = require("./notification.controller");
const constants_1 = require("../../../helpers/constants");
const router = express_1.default.Router();
router.post("/create", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), notification_controller_1.NotificationController);
router.get("/all", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), notification_controller_1.GetNotifications);
router.get("/:id", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), notification_controller_1.getNotification);
exports.default = {
    path: "/admin/notification",
    router: router,
};

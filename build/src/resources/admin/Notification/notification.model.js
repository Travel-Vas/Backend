"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notification_interface_1 = require("./notification.interface");
const constants_1 = require("../../../helpers/constants");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    delivery_channel: { type: String, enum: Object.values(notification_interface_1.channel), required: true },
    audience: { type: String, required: true },
    schedule_date: { type: Date, required: true, default: Date.now() },
    schedule_time: { type: Date, required: true, default: Date.now() },
}, { timestamps: true });
const NotificationModel = (0, mongoose_1.model)(constants_1.ADMIN_NOTIFICATIONS, NotificationSchema);
exports.default = NotificationModel;

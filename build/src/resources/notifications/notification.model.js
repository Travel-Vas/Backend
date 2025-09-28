"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationStatus = exports.NotificationType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var NotificationType;
(function (NotificationType) {
    NotificationType["TRIP_BOOKED"] = "TRIP_BOOKED";
    NotificationType["TRIP_CREATED"] = "TRIP_CREATED";
    NotificationType["PAYMENT_RECEIVED"] = "PAYMENT_RECEIVED";
    NotificationType["USER_REGISTERED"] = "USER_REGISTERED";
    NotificationType["TRIP_CANCELLED"] = "TRIP_CANCELLED";
    NotificationType["TRIP_UPDATED"] = "TRIP_UPDATED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["UNREAD"] = "UNREAD";
    NotificationStatus["READ"] = "READ";
    NotificationStatus["ARCHIVED"] = "ARCHIVED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
const NotificationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    tripId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Trip'
    },
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'BookedTrip'
    },
    recipientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientRole: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(NotificationStatus),
        default: NotificationStatus.UNREAD
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});
NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });
exports.Notification = mongoose_1.default.model('Notification', NotificationSchema);

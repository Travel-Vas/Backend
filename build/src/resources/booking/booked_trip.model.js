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
exports.BookedTrip = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const booking_interface_1 = require("./booking.interface");
const BookedTripSchema = new mongoose_1.Schema({
    tripId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    tripCost: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: Object.values(booking_interface_1.tripType),
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    transportType: {
        type: String,
        enum: Object.values(booking_interface_1.transportType),
        required: true
    },
    accommodation: {
        type: String,
        enum: Object.values(booking_interface_1.Accommodation),
        required: true
    },
    interests: [{
            type: String
        }],
    description: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    otherName: {
        type: String
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    documents: [{
            type: String
        }],
    activities: [
        {
            type: String
        }
    ],
    status: {
        type: String,
        enum: Object.values(booking_interface_1.tripStatus),
        default: booking_interface_1.tripStatus.INPROGRESS
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    creator: {
        type: String
    }
}, {
    timestamps: true
});
exports.BookedTrip = mongoose_1.default.model('BookedTrip', BookedTripSchema);

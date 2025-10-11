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
exports.GhanaTrip = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TransportDetailsSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    price: { type: Number, required: true },
    label: { type: String, required: true }
}, { _id: false });
const HotelDetailsSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    currency: { type: String, required: true },
    rating: { type: Number, required: true }
}, { _id: false });
const TourDetailsSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    country: { type: String, required: true },
    price: { type: Number, required: true },
    sites: [{ type: String }]
}, { _id: false });
const EntryRequirementsSchema = new mongoose_1.Schema({
    hasPassport: { type: Boolean, required: true },
    isVirginPassport: { type: Boolean, required: true },
    hasYellowCard: { type: Boolean, required: true },
    needsYellowCardProcurement: { type: Boolean, default: null }
}, { _id: false });
const BookingDataSchema = new mongoose_1.Schema({
    flowType: { type: String, required: true },
    transport: { type: TransportDetailsSchema, required: true },
    conferenceHotel: { type: HotelDetailsSchema },
    selectedTours: { type: [TourDetailsSchema], default: [] },
    tourHotels: {
        type: Map,
        of: HotelDetailsSchema
    },
    roomSharing: { type: Boolean, default: false },
    intraCityLogistics: { type: Boolean, default: false },
    skipAccommodation: { type: Boolean, default: false },
    entryRequirements: { type: EntryRequirementsSchema, required: true }
}, { _id: false });
const PricingSchema = new mongoose_1.Schema({
    subtotal: { type: Number, required: true },
    borderProtocol: { type: Number, default: 0 },
    contingency: { type: Number, default: 0 },
    serviceCharge: { type: Number, required: true },
    total: { type: Number, required: true }
}, { _id: false });
const GhanaTripSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    bookingData: {
        type: BookingDataSchema,
        required: true
    },
    pricing: {
        type: PricingSchema,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    paymentReference: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    paystackResponse: {
        type: mongoose_1.Schema.Types.Mixed
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
GhanaTripSchema.index({ userId: 1 });
GhanaTripSchema.index({ paymentReference: 1 });
GhanaTripSchema.index({ paymentStatus: 1 });
GhanaTripSchema.index({ createdAt: -1 });
GhanaTripSchema.index({ 'bookingData.flowType': 1 });
exports.GhanaTrip = mongoose_1.default.model('GhanaTrip', GhanaTripSchema);

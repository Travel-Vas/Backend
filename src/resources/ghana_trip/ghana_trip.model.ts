import mongoose, { Document, Schema } from 'mongoose';
import {
    ITransportDetails,
    IHotelDetails,
    ITourDetails,
    IEntryRequirements,
    IBookingData,
    IPricing,
    IGhanaTripBooking
} from './ghana_trip.interface';

export interface IGhanaTripDocument extends Document, Omit<IGhanaTripBooking, 'userId'> {
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TransportDetailsSchema = new Schema({
    type: { type: String, required: true },
    price: { type: Number, required: true },
    label: { type: String, required: true }
}, { _id: false });

const HotelDetailsSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    currency: { type: String, required: true },
    rating: { type: Number, required: true }
}, { _id: false });

const TourDetailsSchema = new Schema({
    id: { type: String, required: true },
    country: { type: String, required: true },
    price: { type: Number, required: true },
    sites: [{ type: String }]
}, { _id: false });

const EntryRequirementsSchema = new Schema({
    hasPassport: { type: Boolean, required: true },
    isVirginPassport: { type: Boolean, required: true },
    hasYellowCard: { type: Boolean, required: true },
    needsYellowCardProcurement: { type: Boolean, default: null }
}, { _id: false });

const BookingDataSchema = new Schema({
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

const PricingSchema = new Schema({
    subtotal: { type: Number, required: true },
    borderProtocol: { type: Number, default: 0 },
    contingency: { type: Number, default: 0 },
    serviceCharge: { type: Number, required: true },
    total: { type: Number, required: true }
}, { _id: false });

const GhanaTripSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.Mixed
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

export const GhanaTrip = mongoose.model<IGhanaTripDocument>('GhanaTrip', GhanaTripSchema);

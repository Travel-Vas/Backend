import mongoose, { Document, Schema } from 'mongoose';
import { ITrip, ITripLoger, IEvents, tripStatus, transportType, Accommodation, tripType } from './booking.interface';

export interface ITripDocument extends ITrip, Document {}

const BookedTripSchema: Schema = new Schema({
    tripId: {
        type: Schema.Types.ObjectId,
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
        enum: Object.values(tripType),
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
        enum: Object.values(transportType),
        required: true
    },
    accommodation: {
        type: String,
        enum: Object.values(Accommodation),
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
            type:String
        }
    ],
    status: {
        type: String,
        enum: Object.values(tripStatus),
        default: tripStatus.INPROGRESS
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    creator: {
        type: String
    }
}, {
    timestamps: true
});

export const BookedTrip = mongoose.model<ITripDocument>('BookedTrip', BookedTripSchema);

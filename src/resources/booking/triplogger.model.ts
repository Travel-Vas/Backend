import {ITripLoger} from "./booking.interface";
import mongoose, {Document, Schema} from "mongoose";

export interface ITripLogerDocument extends ITripLoger, Document {}

const TripLogerSchema: Schema = new Schema({
    tripId: {
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

export const TripLoger = mongoose.model<ITripLogerDocument>('TripLoger', TripLogerSchema);
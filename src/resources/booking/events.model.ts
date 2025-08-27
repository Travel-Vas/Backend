import {IEvents} from "./booking.interface";
import mongoose, {Document, Schema} from "mongoose";

export interface IEventsDocument extends IEvents, Document {}

const EventsSchema: Schema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fee: {
        type: String,
        required: true
    },
    offerValidationDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    attendees: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

export const Events = mongoose.model<IEventsDocument>('Events', EventsSchema);


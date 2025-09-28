import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
    TRIP_BOOKED = 'TRIP_BOOKED',
    TRIP_CREATED = 'TRIP_CREATED',
    PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
    USER_REGISTERED = 'USER_REGISTERED',
    TRIP_CANCELLED = 'TRIP_CANCELLED',
    TRIP_UPDATED = 'TRIP_UPDATED'
}

export enum NotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ',
    ARCHIVED = 'ARCHIVED'
}

export interface INotification {
    type: NotificationType;
    title: string;
    message: string;
    userId?: mongoose.Types.ObjectId;
    tripId?: mongoose.Types.ObjectId;
    bookingId?: mongoose.Types.ObjectId;
    recipientId: mongoose.Types.ObjectId;
    recipientRole: string;
    status: NotificationStatus;
    metadata?: Record<string, any>;
    readAt?: Date;
}

export interface INotificationDocument extends INotification, Document {}

const NotificationSchema: Schema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tripId: {
        type: Schema.Types.ObjectId,
        ref: 'Trip'
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'BookedTrip'
    },
    recipientId: {
        type: Schema.Types.ObjectId,
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
        type: Schema.Types.Mixed
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
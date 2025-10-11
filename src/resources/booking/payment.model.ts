import mongoose, { Document, Schema } from 'mongoose';
import { PaymentStatus, PaymentType } from './payment.interface';

export interface IPaymentDocument extends Document {
    tripId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    reference: string;
    amount: number;
    totalAmount?: number;
    installmentNumber?: number;
    totalInstallments?: number;
    paymentType: PaymentType;
    status: PaymentStatus;
    paystackResponse?: any;
    metadata?: any;
    paidAt?: Date;
    nextPaymentDate?: Date;
    webhookProcessed?: boolean;
    webhookEventId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
    tripId: {
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: function(this: IPaymentDocument) {
            return this.paymentType === PaymentType.INSTALLMENT;
        }
    },
    installmentNumber: {
        type: Number,
        required: function(this: IPaymentDocument) {
            return this.paymentType === PaymentType.INSTALLMENT;
        }
    },
    totalInstallments: {
        type: Number,
        required: function(this: IPaymentDocument) {
            return this.paymentType === PaymentType.INSTALLMENT;
        }
    },
    paymentType: {
        type: String,
        enum: Object.values(PaymentType),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PENDING
    },
    paystackResponse: {
        type: Schema.Types.Mixed
    },
    metadata: {
        type: Schema.Types.Mixed
    },
    paidAt: {
        type: Date
    },
    nextPaymentDate: {
        type: Date,
        required: function(this: IPaymentDocument) {
            return this.paymentType === PaymentType.INSTALLMENT &&
                   this.status === PaymentStatus.SUCCESS &&
                   this.installmentNumber! < this.totalInstallments!;
        }
    },
    webhookProcessed: {
        type: Boolean,
        default: false
    },
    webhookEventId: {
        type: String,
        sparse: true
    }
}, {
    timestamps: true
});

PaymentSchema.index({ tripId: 1, userId: 1 });
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ webhookEventId: 1 });

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
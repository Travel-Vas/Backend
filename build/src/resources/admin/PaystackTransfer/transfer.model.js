"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferModel = void 0;
const mongoose_1 = require("mongoose");
const TransferSchema = new mongoose_1.Schema({
    source: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: 'Transfer payment'
    },
    currency: {
        type: String,
        enum: ['NGN', 'GHS'],
        default: 'NGN'
    },
    account_reference: {
        type: String
    },
    reference: {
        type: String
    },
    transfer_code: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'otp'],
        default: 'pending'
    },
    paystack_response: {
        type: mongoose_1.Schema.Types.Mixed
    },
    created_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
exports.TransferModel = (0, mongoose_1.model)('Transfer', TransferSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectedAccountModel = void 0;
const mongoose_1 = require("mongoose");
const ConnectedAccountSchema = new mongoose_1.Schema({
    stripe_account_id: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['express', 'standard', 'custom'],
        required: true
    },
    country: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    business_type: {
        type: String,
        enum: ['individual', 'company', 'non_profit', 'government_entity']
    },
    charges_enabled: {
        type: Boolean,
        default: false
    },
    payouts_enabled: {
        type: Boolean,
        default: false
    },
    details_submitted: {
        type: Boolean,
        default: false
    },
    default_currency: {
        type: String
    },
    stripe_response: {
        type: mongoose_1.Schema.Types.Mixed
    },
    created_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
exports.ConnectedAccountModel = (0, mongoose_1.model)('ConnectedAccount', ConnectedAccountSchema);

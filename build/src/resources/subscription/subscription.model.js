"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    pricingId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Pricing", required: true }, // Reference to the Pricing model
    status: {
        type: String,
        enum: ["active", "canceled", "paused", "past_due", "pending", "failed", "expired"],
        required: true,
    },
    storageSize: {
        type: String,
    },
    upgradePeriodEnds: { type: Date, required: true, default: Date.now },
    upgradeWillCancelAt: { type: Date, required: true, default: Date.now },
    startDate: { type: Date, required: true, default: Date.now },
    currentPeriodEnd: { type: Date },
    canceledAt: { type: Date },
    paymentMethod: { type: String, },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date },
    stripeSetupIntentId: {
        type: String,
    },
    stripeSubscriptionId: {
        type: String,
    },
    paymentIntentId: {
        type: String,
    },
    prev_subscriptionStatus: {
        type: String,
        enum: ["active", "canceled", "paused", "past_due", "pending", "failed", "expired"],
    },
    interval: {
        type: String,
        enum: ["monthly", "yearly", "quarterly", "daily", "weekly", "quarterly", "biannually"],
        required: true,
    },
    metadata: { type: Object }, // Stores custom key-value pairs
    paystackSubscriptionCode: {
        type: String,
    },
    paystackEmailToken: {
        type: String,
    },
    paystackReference: {
        type: String,
    },
    paystackCustomerCode: {
        type: String,
    },
    paystackAuthorizationCode: {
        type: String,
    },
    payment_provider: {
        type: String
    },
    stripeCustomerId: {
        type: String,
    },
    pgSpace: {
        type: String
    },
    isAssignedPlan: {
        type: Boolean,
        default: false
    }
});
const SubscriptionModel = (0, mongoose_1.model)("Subscription", subscriptionSchema);
exports.default = SubscriptionModel;

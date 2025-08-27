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
exports.TransactionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const transaction_interface_1 = require("./transaction.interface");
const constants_1 = require("../../helpers/constants");
const TransactionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.String, ref: 'User' },
    walletId: { type: mongoose_1.Schema.Types.String, ref: 'Wallet' },
    clientId: { type: mongoose_1.Schema.Types.String, ref: 'Client' },
    shootId: { type: mongoose_1.Schema.Types.String, ref: 'Shoot' },
    pricingId: { type: mongoose_1.Schema.Types.String, ref: 'Pricing' },
    currency: {
        type: String
    },
    txnReference: String,
    txnStatus: {
        type: String,
        enum: transaction_interface_1.TxnStatus,
        default: transaction_interface_1.TxnStatus.PENDING
    },
    message: {
        type: String,
    },
    processedBy: {
        type: String,
    },
    processedAt: {
        type: Date
    },
    stripePaymentIntentId: {
        type: String,
    },
    stripeSubscriptionId: {
        type: String,
    },
    stripeSetupIntentId: {
        type: String,
    },
    pendingSubscriptionData: {
        type: Object,
    },
    transactionType: {
        type: String,
        default: 'deposit'
    },
    paymentMethods: {
        type: String,
    },
    email: {
        type: String,
    },
    packageType: {
        type: String,
    },
    noOfPhotos: {
        type: Number
    },
    amount: {
        type: String,
    },
    reason: {
        type: String,
    },
    ipAddress: String,
    userAgent: String,
    provider: {
        name: String, // e.g., "stripe", "paypal"
        referenceId: String, // External transaction ID
        status: String, // Status from provider
        metadata: mongoose_1.default.Schema.Types.Mixed
    },
    paystackReference: {
        type: String,
    },
    paystackAccessCode: {
        type: String,
    },
    completedAt: {
        type: Date
    },
    failedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    disputeCreatedAt: {
        type: Date
    },
    metaData: {
        type: Object
    }
}, {
    timestamps: true
});
exports.TransactionModel = mongoose_1.default.model(constants_1.TRANSACTION_TABLE, TransactionSchema);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerModel = exports.WalletModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const BankAccountSchema = new mongoose_1.default.Schema({
    stripeBankAccountId: String,
    bankName: String,
    accountNumber: String,
    accountName: String,
    bankCode: String,
    country: String,
    currency: String,
    isDefault: { type: Boolean, default: false }
}, { _id: false });
const walletSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0 // Prevent negative balances
    },
    currency: {
        type: String,
        required: true,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'NGN']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'frozen', 'closed'],
        default: 'active'
    },
    walletNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => `WALLET-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`
    },
    stripeAccountId: {
        type: String,
    },
    bankAccounts: {
        type: [BankAccountSchema],
        default: []
    },
    metadata: {
        type: Map,
        of: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    },
    walletPin: {
        type: String,
    },
}, {
    timestamps: true,
});
const ledgerSchema = new mongoose_1.default.Schema({
    walletId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
        index: true
    },
    transactionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['credit', 'debit']
    },
    amount: {
        type: Number,
        required: true,
        min: 0 // Should always be positive, sign is determined by type
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: Map,
        of: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    // Ledger entries should never be modified after creation
    // This ensures integrity of the financial record
    immutable: true
});
ledgerSchema.index({ walletId: 1, createdAt: -1 });
ledgerSchema.index({ transactionId: 1 });
walletSchema.index({ userId: 1, currency: 1 }, { unique: true });
const WalletModel = mongoose_1.default.model('Wallet', walletSchema);
exports.WalletModel = WalletModel;
const LedgerModel = mongoose_1.default.model('Ledger', ledgerSchema);
exports.LedgerModel = LedgerModel;

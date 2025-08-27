"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
exports.parseStorageSizeWithUnit = parseStorageSizeWithUnit;
const stripe_1 = __importDefault(require("./stripe"));
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const createPaymentIntent = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntent = yield stripe_1.default.paymentIntents.create({
            amount: Math.floor(payload.amount * 100), // amount in cents
            currency: 'usd',
            payment_method: 'card',
            payment_method_types: [
                'card',
                'us_bank_account', // ACH direct bank transfer
                'cashapp', // Cash App
                'apple_pay', // Apple Pay
                'google_pay' // Google Pay
            ],
            metadata: {
                userId: payload.userId.toString(),
                storageSize: payload.storageSize,
                transactionId: payload.transactionId.toString(),
            },
            // Optional: Configure additional payment intent options
            setup_future_usage: 'off_session', // Allow saving payment method for future use
            // Optional: Add specific configurations
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' // Prevent redirects for a smoother payment flow
            }
        });
        return paymentIntent;
    }
    catch (error) {
        // Handle any Stripe-specific errors
        console.error('Payment Intent Creation Error:', error);
        throw new App_1.CustomError({
            message: 'Failed to create payment intent',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.createPaymentIntent = createPaymentIntent;
function parseStorageSizeWithUnit(storageString) {
    var _a;
    const match = storageString.match(/^(\d+)\s*(GB|TB|MB)?$/i);
    if (!match) {
        throw new Error('Invalid storage format');
    }
    return {
        size: parseInt(match[1], 10),
        unit: (((_a = match[2]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'GB')
    };
}

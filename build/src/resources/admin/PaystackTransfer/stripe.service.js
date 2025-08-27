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
exports.initiateStripeTransferService = void 0;
const stripe_1 = __importDefault(require("../../../utils/stripe"));
const transfer_model_1 = require("./transfer.model");
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const initiateStripeTransferService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create Stripe transfer
        const transfer = yield stripe_1.default.transfers.create(Object.assign(Object.assign({ amount: payload.amount, currency: payload.currency, destination: payload.destination }, (payload.transfer_group && { transfer_group: payload.transfer_group })), (payload.description && { description: payload.description })));
        // Save transfer record to database
        const transferRecord = new transfer_model_1.TransferModel({
            source: 'stripe_balance',
            amount: payload.amount,
            recipient: payload.destination,
            reason: payload.description || 'Stripe transfer payment',
            currency: payload.currency.toUpperCase(),
            reference: transfer.id,
            transfer_code: transfer.id,
            status: transfer.object === 'transfer' ? 'success' : 'pending',
            paystack_response: transfer, // Storing Stripe response in the same field for consistency
            created_by: payload.created_by
        });
        yield transferRecord.save();
        return {
            status: true,
            message: 'Stripe transfer initiated successfully',
            data: {
                transfer_id: transferRecord._id,
                stripe_transfer_id: transfer.id,
                amount: transfer.amount,
                currency: transfer.currency,
                destination: transfer.destination,
                status: transfer.object === 'transfer' ? 'success' : 'pending',
                created: transfer.created
            }
        };
    }
    catch (error) {
        console.log('Stripe transfer error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to initiate Stripe transfer',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
});
exports.initiateStripeTransferService = initiateStripeTransferService;

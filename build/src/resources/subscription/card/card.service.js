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
exports.getUserPaymentMethods = exports.cardService = void 0;
const App_1 = require("../../../helpers/lib/App");
const card_model_1 = require("./card.model");
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = __importDefault(require("../../users/user.model"));
const stripe_1 = __importDefault(require("../../../utils/stripe"));
const cardService = (Args) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardExist = yield card_model_1.CardModel.findOne({
            userId: Args.userId,
            cardNumber: Args.cardNumber,
        }).lean().exec();
        if (cardExist) {
            throw new App_1.CustomError({
                message: 'Card already exists',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const response = yield card_model_1.CardModel.create(Args);
        return response;
    }
    catch (err) {
        console.log(err);
        throw new App_1.CustomError({
            message: err.message,
            code: err.code,
        });
    }
});
exports.cardService = cardService;
const getUserPaymentMethods = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First, get the user from your database to retrieve the Stripe customer ID
        const user = yield user_model_1.default.findById(userId);
        if (!user || !user.stripeCustomerId) {
            throw new App_1.CustomError({
                message: "User has no associated Stripe account",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        // Fetch all payment methods attached to this customer
        const paymentMethods = yield stripe_1.default.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: 'card' // You can also use 'sepa_debit', 'bank_account', etc.
        });
        return paymentMethods.data.map((method) => ({
            id: method.id,
            type: method.type,
            created: method.created,
            isDefault: method.metadata.isDefault === 'true',
            card: method.card ? {
                brand: method.card.brand,
                last4: method.card.last4,
                exp_month: method.card.exp_month,
                exp_year: method.card.exp_year,
                country: method.card.country,
                funding: method.card.funding
            } : undefined
        }));
    }
    catch (error) {
        console.error("Error fetching payment methods:", error);
        if (error instanceof App_1.CustomError) {
            throw error;
        }
        throw new App_1.CustomError({
            message: "Failed to retrieve payment methods",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getUserPaymentMethods = getUserPaymentMethods;

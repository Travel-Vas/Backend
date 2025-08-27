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
exports.listConnectedAccountsService = exports.getConnectedAccountService = exports.createConnectedAccountService = void 0;
const stripe_1 = __importDefault(require("../../../utils/stripe"));
const connected_account_model_1 = require("./connected-account.model");
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = __importDefault(require("../../users/user.model"));
const billing_model_1 = require("../../payment/billing.model");
const createConnectedAccountService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Prepare account creation parameters
        const accountParams = Object.assign(Object.assign(Object.assign({ type: payload.type, country: payload.country }, (payload.email && { email: payload.email })), (payload.business_type && { business_type: payload.business_type })), (payload.default_currency && { default_currency: payload.default_currency }));
        // Add individual information if provided
        const userDetails = yield user_model_1.default.findOne({
            _id: payload.userId
        }).lean().exec();
        const billingDetails = yield billing_model_1.BillingModel.findOne({
            user_id: payload.userId
        }).lean().exec();
        if (!billingDetails) {
            throw new App_1.CustomError({
                message: "Billing details not found for user",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        if (billingDetails.country !== payload.country) {
            throw new App_1.CustomError({
                message: "Payment not supported for your billing location",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        if (!(billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.routing_number)) {
            throw new App_1.CustomError({
                message: "Routing number is required",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        if (!userDetails) {
            throw new App_1.CustomError({
                message: "Record not found ",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        if (payload.individual) {
            accountParams.individual = {};
            if (payload.individual.first_name)
                accountParams.individual.first_name = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name) || payload.individual.first_name;
            if (payload.individual.last_name)
                accountParams.individual.last_name = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name) || payload.individual.last_name;
            if (payload.individual.email)
                accountParams.individual.email = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.email) || payload.individual.email;
            if (payload.individual.phone)
                accountParams.individual.phone = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.phone) || payload.individual.phone;
            if (payload.individual.dob)
                accountParams.individual.dob = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.dob) || payload.individual.dob;
            if (payload.individual.address)
                accountParams.individual.address = `${userDetails === null || userDetails === void 0 ? void 0 : userDetails.city}${userDetails === null || userDetails === void 0 ? void 0 : userDetails.state}${userDetails === null || userDetails === void 0 ? void 0 : userDetails.country}` || payload.individual.address;
            if (payload.individual.id_number)
                accountParams.individual.id_number = payload.individual.id_number;
            if (payload.individual.ssn_last_4)
                accountParams.individual.ssn_last_4 = payload.individual.ssn_last_4;
        }
        // Add company information if provided
        if (payload.company) {
            accountParams.company = {};
            if (payload.company.name)
                accountParams.company.name = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name) || payload.company.name;
            if (payload.company.phone)
                accountParams.company.phone = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.phone) || payload.company.phone;
            if (payload.company.tax_id)
                accountParams.company.tax_id = payload.company.tax_id;
            if (payload.company.address)
                accountParams.company.address = payload.company.address;
        }
        // Add business profile if provided
        if (payload.business_profile) {
            accountParams.business_profile = payload.business_profile;
        }
        // Add TOS acceptance if provided
        if (payload.tos_acceptance) {
            accountParams.tos_acceptance = payload.tos_acceptance;
        }
        // Add capabilities if provided
        if (payload.capabilities) {
            accountParams.capabilities = payload.capabilities;
        }
        // Create Stripe connected account
        const account = yield stripe_1.default.accounts.create(accountParams);
        const accountExist = yield connected_account_model_1.ConnectedAccountModel.findOne({
            user_id: payload.userId,
            country: payload.country,
            default_currency: payload.default_currency,
        });
        if (accountExist) {
            throw new App_1.CustomError({
                message: 'Account already exist',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const COUNTRY_CURRENCY_MAP = {
            "us": { countryCode: "US", currencyCode: "USD" },
            "nigeria": { countryCode: "NG", currencyCode: "NGN" },
            "canada": { countryCode: "CA", currencyCode: "CAD" },
            "gb": { countryCode: "GB", currencyCode: "GBP" },
            "eurozone": { countryCode: "EU", currencyCode: "EUR" },
            // …add more entries here…
        };
        function getCountryCurrency(countryName) {
            var _a;
            const key = countryName.trim().toLowerCase();
            return (_a = COUNTRY_CURRENCY_MAP[key]) !== null && _a !== void 0 ? _a : null;
        }
        const currencyDetails = yield getCountryCurrency(billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country.toLowerCase());
        yield stripe_1.default.accounts.createExternalAccount(account.id, {
            external_account: {
                object: 'bank_account',
                country: currencyDetails.countryCode,
                currency: currencyDetails.currencyCode,
                routing_number: billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.routing_number,
                account_number: billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.account_number,
            },
        });
        // Save connected account record to database
        const connectedAccountRecord = new connected_account_model_1.ConnectedAccountModel(Object.assign({ stripe_account_id: account.id, type: account.type, country: account.country, email: account.email, business_type: account.business_type, charges_enabled: true, payouts_enabled: true, details_submitted: account.details_submitted, default_currency: account.default_currency, stripe_response: account, created_by: payload.created_by }, (payload.userId && { user_id: payload.userId })));
        yield connectedAccountRecord.save();
        return {
            status: true,
            message: 'Connected account created successfully',
            data: {
                account_id: connectedAccountRecord._id,
                stripe_account_id: account.id,
                type: account.type,
                country: account.country,
                email: account.email,
                business_type: account.business_type,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted,
                default_currency: account.default_currency,
                created: account.created
            }
        };
    }
    catch (error) {
        console.log('Stripe connected account creation error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to create connected account',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
});
exports.createConnectedAccountService = createConnectedAccountService;
const getConnectedAccountService = (accountId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield stripe_1.default.accounts.retrieve(accountId);
        return {
            status: true,
            message: 'Connected account retrieved successfully',
            data: account
        };
    }
    catch (error) {
        console.log('Stripe connected account retrieval error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to retrieve connected account',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
});
exports.getConnectedAccountService = getConnectedAccountService;
const listConnectedAccountsService = (created_by) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield connected_account_model_1.ConnectedAccountModel.find({ created_by }).populate('user_id', 'name email');
        return {
            status: true,
            message: 'Connected accounts retrieved successfully',
            data: accounts
        };
    }
    catch (error) {
        console.log('Connected accounts list error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to retrieve connected accounts',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.listConnectedAccountsService = listConnectedAccountsService;

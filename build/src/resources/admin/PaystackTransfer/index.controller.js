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
exports.listConnectedAccountsController = exports.getConnectedAccountController = exports.createConnectedAccountController = exports.stripeTransferController = exports.paystackTransfer = exports.initiateTransfer = void 0;
const http_status_codes_1 = require("http-status-codes");
const App_1 = require("../../../helpers/lib/App");
const transfer_service_1 = require("./transfer.service");
const stripe_service_1 = require("./stripe.service");
const connected_account_service_1 = require("./connected-account.service");
const validation_1 = require("./validation");
const stripe_validation_1 = require("./stripe.validation");
const connected_account_validation_1 = require("./connected-account.validation");
const reference_1 = __importDefault(require("../../../utils/reference"));
const initiateTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error, value } = validation_1.initiateTransferValidation.validate(req.body);
    if (error) {
        throw new App_1.CustomError({
            message: error.details[0].message,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const payload = {
        amount: value.amount,
        reason: value.reason,
        currency: value.currency,
        reference: (0, reference_1.default)(req.body.userId),
        userId: req.body.userId,
        created_by: req['user']._id
    };
    const response = yield (0, transfer_service_1.initiateTransferService)(payload);
    res.json({
        msg: response.message,
        data: response.data,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.initiateTransfer = initiateTransfer;
const paystackTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        otp: req.body.otpCode
    };
    if (!payload.otp) {
        throw new App_1.CustomError({
            message: 'Otp code is required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const userId = req.body.userId || req['user']._id;
    const response = yield (0, transfer_service_1.finalizeTransferService)(payload.otp, userId);
    res.json({
        msg: response.message,
        data: response.data,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.paystackTransfer = paystackTransfer;
const stripeTransferController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error, value } = stripe_validation_1.stripeTransferValidation.validate(req.body);
    if (error) {
        throw new App_1.CustomError({
            message: error.details[0].message,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const payload = {
        amount: value.amount,
        currency: value.currency,
        destination: value.destination,
        transfer_group: value.transfer_group,
        description: value.description,
        userId: value.userId,
        created_by: req['user']._id
    };
    const response = yield (0, stripe_service_1.initiateStripeTransferService)(payload);
    res.json({
        msg: response.message,
        data: response.data,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.stripeTransferController = stripeTransferController;
const createConnectedAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error, value } = connected_account_validation_1.createConnectedAccountValidation.validate(req.body);
    if (error) {
        throw new App_1.CustomError({
            message: error.details[0].message,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const payload = {
        type: value.type,
        country: value.country,
        email: value.email,
        business_type: value.business_type,
        individual: value.individual,
        business_profile: value.business_profile,
        company: value.company,
        tos_acceptance: value.tos_acceptance,
        capabilities: value.capabilities,
        default_currency: value.default_currency,
        userId: value.userId,
        created_by: req['user']._id
    };
    const response = yield (0, connected_account_service_1.createConnectedAccountService)(payload);
    res.json({
        msg: response.message,
        data: response.data,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.createConnectedAccountController = createConnectedAccountController;
const getConnectedAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accountId = req.params.accountId;
    if (!accountId) {
        throw new App_1.CustomError({
            message: 'Account ID is required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, connected_account_service_1.getConnectedAccountService)(accountId);
    res.json({
        msg: response.message,
        data: response.data,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getConnectedAccountController = getConnectedAccountController;
const listConnectedAccountsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const created_by = req['user']._id;
    const response = yield (0, connected_account_service_1.listConnectedAccountsService)(created_by);
    res.json({
        msg: response.message,
        data: response.data,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.listConnectedAccountsController = listConnectedAccountsController;

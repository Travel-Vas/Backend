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
exports.finalizeTransferService = exports.initiateTransferService = void 0;
const axios_1 = __importDefault(require("axios"));
const transfer_model_1 = require("./transfer.model");
const billing_model_1 = require("../../payment/billing.model");
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const paystackInstance = axios_1.default.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
});
const initiateTransferService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        // create trasnfer receipient
        const billingDetails = yield billing_model_1.BillingModel.findOne({
            user_id: payload.userId
        });
        if (!(billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.account_number) || !(billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.bank_name)) {
            throw new App_1.CustomError({
                message: "Billing details is required",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // call paystack receipient api
        const requestPayload = {
            type: "nuban",
            name: billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.bank_name,
            account_number: billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.account_number,
            bank_code: (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.sort_code) || (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.bank_code),
            currency: "NGN"
        };
        let receipientResponse;
        try {
            receipientResponse = yield paystackInstance.post("/transferrecipient", requestPayload);
        }
        catch (error) {
            console.log(error);
            throw new App_1.CustomError({
                message: error.message,
                code: error.code,
            });
        }
        const transferData = Object.assign(Object.assign({ source: "balance", amount: payload.amount, recipient: (_b = (_a = receipientResponse === null || receipientResponse === void 0 ? void 0 : receipientResponse.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.recipient_code, reason: payload.reason || 'Transfer payment', currency: payload.currency || 'NGN' }, (payload.account_reference && { account_reference: payload.account_reference })), (payload.reference && { reference: payload.reference }));
        // store receipient code
        yield billing_model_1.BillingModel.findOneAndUpdate({
            user_id: payload.userId,
        }, {
            recipient: (_d = (_c = receipientResponse === null || receipientResponse === void 0 ? void 0 : receipientResponse.data) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.recipient_code
        }, { new: true });
        const response = yield paystackInstance.post('/transfer', transferData);
        // Save transfer record to database
        const transferRecord = new transfer_model_1.TransferModel({
            source: "balance",
            amount: payload.amount,
            recipient: (_f = (_e = receipientResponse === null || receipientResponse === void 0 ? void 0 : receipientResponse.data) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.recipient_code,
            reason: payload.reason || 'Transfer payment',
            currency: payload.currency || 'NGN',
            account_reference: payload.account_reference,
            reference: payload.reference,
            transfer_code: (_h = (_g = response === null || response === void 0 ? void 0 : response.data) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.transfer_code,
            status: (_k = (_j = response === null || response === void 0 ? void 0 : response.data) === null || _j === void 0 ? void 0 : _j.data) === null || _k === void 0 ? void 0 : _k.status,
            paystack_response: response.data,
            created_by: payload.created_by
        });
        yield transferRecord.save();
        return {
            status: true,
            message: 'Transfer initiated successfully',
            data: {
                transfer_id: transferRecord._id,
                transfer_code: response.data.transfer_code,
                status: response.data.status,
                amount: response.data.amount,
                recipient: response.data.recipient,
                reference: response.data.reference
            }
        };
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.initiateTransferService = initiateTransferService;
const finalizeTransferService = (otp, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Get billing details to find transfer code
        const billingDetails = yield billing_model_1.BillingModel.findOne({
            user_id: userId
        });
        if (!(billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.recipient)) {
            throw new App_1.CustomError({
                message: "No transfer recipient found for this user",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Get the latest transfer record for this user
        const transferRecord = yield transfer_model_1.TransferModel.findOne({
            recipient: billingDetails.recipient
        }).sort({ createdAt: -1 });
        if (!(transferRecord === null || transferRecord === void 0 ? void 0 : transferRecord.transfer_code)) {
            throw new App_1.CustomError({
                message: "No pending transfer found",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Finalize the transfer with Paystack
        const finalizeData = {
            transfer_code: transferRecord.transfer_code,
            otp: otp
        };
        const response = yield paystackInstance.post('/transfer/finalize_transfer', finalizeData);
        // Update transfer record with final status
        yield transfer_model_1.TransferModel.findByIdAndUpdate(transferRecord._id, {
            status: response.data.data.status,
            paystack_response: response.data,
            finalized_at: new Date()
        });
        return {
            status: true,
            message: 'Transfer finalized successfully',
            data: {
                transfer_id: transferRecord._id,
                transfer_code: transferRecord.transfer_code,
                status: response.data.data.status,
                amount: response.data.data.amount,
                recipient: response.data.data.recipient,
                reference: response.data.data.reference
            }
        };
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message,
            code: ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.finalizeTransferService = finalizeTransferService;

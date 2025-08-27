"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawTxSchema = exports.generatePaymentLinkSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.generatePaymentLinkSchema = joi_1.default.object({
    amount: joi_1.default.number().required().min(1000)
});
exports.withdrawTxSchema = joi_1.default.object({
    amount: joi_1.default.number().required().min(100),
    otp: joi_1.default.string().required(),
    bank_name: joi_1.default.string(),
    account_no: joi_1.default.string(),
});

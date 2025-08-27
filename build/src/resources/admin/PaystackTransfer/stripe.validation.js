"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeTransferValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.stripeTransferValidation = joi_1.default.object({
    amount: joi_1.default.number().integer().min(1).required().messages({
        'number.base': 'Amount must be a number',
        'number.integer': 'Amount must be an integer',
        'number.min': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
    }),
    currency: joi_1.default.string().required().messages({
        'string.empty': 'Currency is required',
        'any.required': 'Currency is required'
    }),
    destination: joi_1.default.string().required().messages({
        'string.empty': 'Destination account is required',
        'any.required': 'Destination account is required'
    }),
    transfer_group: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    userId: joi_1.default.string().optional()
});

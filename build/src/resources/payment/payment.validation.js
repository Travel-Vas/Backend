"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processInstallmentSchema = exports.verifyPaymentSchema = exports.initializeInstallmentPaymentSchema = exports.initializeFullPaymentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.initializeFullPaymentSchema = joi_1.default.object({
    tripId: joi_1.default.string().required().messages({
        'string.base': 'Trip ID must be a string',
        'any.required': 'Trip ID is required'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});
exports.initializeInstallmentPaymentSchema = joi_1.default.object({
    tripId: joi_1.default.string().required().messages({
        'string.base': 'Trip ID must be a string',
        'any.required': 'Trip ID is required'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    installmentCount: joi_1.default.number().integer().min(2).max(12).required().messages({
        'number.base': 'Installment count must be a number',
        'number.integer': 'Installment count must be an integer',
        'number.min': 'Installment count must be at least 2',
        'number.max': 'Installment count must be at most 12',
        'any.required': 'Installment count is required'
    }),
    frequency: joi_1.default.string().valid('weekly', 'monthly', 'quarterly').default('monthly').messages({
        'any.only': 'Frequency must be one of: weekly, monthly, quarterly'
    })
});
exports.verifyPaymentSchema = joi_1.default.object({
    reference: joi_1.default.string().required().messages({
        'string.base': 'Reference must be a string',
        'any.required': 'Payment reference is required'
    })
});
exports.processInstallmentSchema = joi_1.default.object({
    paymentId: joi_1.default.string().required().messages({
        'string.base': 'Payment ID must be a string',
        'any.required': 'Payment ID is required'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});

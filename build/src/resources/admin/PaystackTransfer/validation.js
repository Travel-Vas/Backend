"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateTransferValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.initiateTransferValidation = joi_1.default.object({
    amount: joi_1.default.number().integer().min(1).required().messages({
        'number.base': 'Amount must be a number',
        'number.integer': 'Amount must be an integer',
        'number.min': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
    }),
    reason: joi_1.default.string().optional(),
    currency: joi_1.default.string().valid('NGN', 'GHS').optional().messages({
        'any.only': 'Currency must be either NGN or GHS'
    }),
    userId: joi_1.default.string().lowercase().pattern(/^[a-z0-9_-]+$/).optional().messages({
        'string.pattern.base': 'userId must contain only lowercase letters, numbers, hyphens, and underscores'
    })
});

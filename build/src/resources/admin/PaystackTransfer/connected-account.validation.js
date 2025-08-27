"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnectedAccountValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createConnectedAccountValidation = joi_1.default.object({
    type: joi_1.default.string().valid('express', 'standard', 'custom').required().messages({
        'any.only': 'Type must be express, standard, or custom',
        'any.required': 'Account type is required'
    }),
    country: joi_1.default.string().required().messages({
        'string.empty': 'Country is required',
        'any.required': 'Country is required'
    }),
    email: joi_1.default.string().email().optional(),
    business_type: joi_1.default.string().valid('individual', 'company', 'non_profit', 'government_entity').optional(),
    individual: joi_1.default.object({
        first_name: joi_1.default.string().optional(),
        last_name: joi_1.default.string().optional(),
        email: joi_1.default.string().email().optional(),
        phone: joi_1.default.string().optional(),
        dob: joi_1.default.object({
            day: joi_1.default.number().integer().min(1).max(31).required(),
            month: joi_1.default.number().integer().min(1).max(12).required(),
            year: joi_1.default.number().integer().min(1900).max(new Date().getFullYear()).required()
        }).optional(),
        address: joi_1.default.object({
            line1: joi_1.default.string().required(),
            line2: joi_1.default.string().optional(),
            city: joi_1.default.string().required(),
            state: joi_1.default.string().optional(),
            postal_code: joi_1.default.string().required(),
            country: joi_1.default.string().required()
        }).optional(),
        id_number: joi_1.default.string().optional(),
        ssn_last_4: joi_1.default.string().length(4).pattern(/^\d{4}$/).optional()
    }).optional(),
    business_profile: joi_1.default.object({
        name: joi_1.default.string().optional(),
        product_description: joi_1.default.string().optional(),
        support_email: joi_1.default.string().email().optional(),
        support_phone: joi_1.default.string().optional(),
        support_url: joi_1.default.string().uri().optional(),
        url: joi_1.default.string().uri().optional()
    }).optional(),
    company: joi_1.default.object({
        name: joi_1.default.string().optional(),
        phone: joi_1.default.string().optional(),
        tax_id: joi_1.default.string().optional(),
        address: joi_1.default.object({
            line1: joi_1.default.string().required(),
            line2: joi_1.default.string().optional(),
            city: joi_1.default.string().required(),
            state: joi_1.default.string().optional(),
            postal_code: joi_1.default.string().required(),
            country: joi_1.default.string().required()
        }).optional()
    }).optional(),
    tos_acceptance: joi_1.default.object({
        date: joi_1.default.number().optional(),
        ip: joi_1.default.string().optional(),
        user_agent: joi_1.default.string().optional()
    }).optional(),
    capabilities: joi_1.default.object({
        card_payments: joi_1.default.object({
            requested: joi_1.default.boolean().required()
        }).required(),
        transfers: joi_1.default.object({
            requested: joi_1.default.boolean().required()
        }).optional()
    }).required().messages({
        'any.required': 'Capabilities with card_payments.requested is required'
    }),
    default_currency: joi_1.default.string().optional(),
    userId: joi_1.default.string().optional()
});

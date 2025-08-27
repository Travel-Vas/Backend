"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingSchema = exports.updateBankDetailsSchema = exports.updatePasswordSchema = exports.forgotPasswordSchema = exports.clientAccessKeyValidation = exports.resetPasswordsSchema = exports.resetPasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.verifyAccountSchema = exports.deleteShippingAddressSchema = exports.addShippingAddressSchema = exports.resendOTPSchema = exports.createUserSchema = void 0;
const date_1 = __importDefault(require("@joi/date"));
const JoiImport = __importStar(require("joi"));
const Joi = JoiImport.extend(date_1.default);
const constants_1 = require("../../helpers/constants");
exports.createUserSchema = Joi.object({
    password: Joi.string().required().min(4),
    role: Joi.string().valid(constants_1.UserRole.USER, constants_1.UserRole.ADMIN, constants_1.UserRole.SUPERADMIN),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string(),
    referrerCode: Joi.string()
        .allow('', null) // ✅ allow empty string and null
        .optional(),
});
exports.resendOTPSchema = Joi.object({
    email: Joi.string().required(),
    otpType: Joi.string().required().valid(...Object.values(constants_1.ResendOTPType)),
});
exports.addShippingAddressSchema = Joi.object({
    addresses: Joi.array().items(Joi.string()).required()
});
exports.deleteShippingAddressSchema = Joi.object({
    index: Joi.number().required()
});
exports.verifyAccountSchema = Joi.object({
    email: Joi.string().required(),
    otp: Joi.string().required(),
});
exports.loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required().min(8),
});
exports.updateProfileSchema = Joi.object({
    dob: Joi.date().format('DD-MM-YYYY'), // Date of birth
    full_name: Joi.string().optional(), // Full name
    phone: Joi.string().optional(), // Phone number
    website: Joi.string().uri().optional(), // Website URL (valid URI format)
    extra_picture_price: Joi.number().optional(),
    business_country: Joi.string().optional(), // Business country
    business_address: Joi.string().optional(), // Business address
    business_state: Joi.string().optional(), // Business state
    business_city: Joi.string().optional(), // Business city
    instagram: Joi.string().optional(), // Instagram profile URL (or username)
    facebook: Joi.string().optional(), // Facebook profile URL (or username)
    linkedin: Joi.string().optional(), // LinkedIn profile URL (or username)
    twitter: Joi.string().optional(), // Twitter profile URL (or username)
});
exports.resetPasswordSchema = Joi.object({
    email: Joi.string().required(),
    otp: Joi.string().required(),
});
exports.resetPasswordsSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Email is required to reset your password.'
    }), // Ensure email is in a valid format
    password: Joi.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Password must be at least 6 characters long.',
        'any.required': 'Password is required.'
    }), // Ensure the password is at least 6 characters
    confirm_password: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
        'any.only': 'Password and confirmation must match.',
        'any.required': 'Please confirm your password.'
    }) // Ensure password and confirm_password match
});
exports.clientAccessKeyValidation = Joi.object({
    access_key: Joi.string().required()
});
exports.forgotPasswordSchema = Joi.object({
    email: Joi.string().required(),
});
exports.updatePasswordSchema = Joi.object({
    old_password: Joi.string().required().min(8),
    new_password: Joi.string().required().min(8)
});
exports.updateBankDetailsSchema = Joi.object({
    account_no: Joi.string().required().min(10).max(10),
    bank_code: Joi.string().required()
});
exports.onboardingSchema = Joi.object({
    country: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'Country is required',
        'string.min': 'Country must be at least 2 characters long',
        'string.max': 'Country must not exceed 50 characters',
        'any.required': 'Country is required'
    }),
    state: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'State is required',
        'string.min': 'State must be at least 2 characters long',
        'string.max': 'State must not exceed 50 characters',
        'any.required': 'State is required'
    }),
    city: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City must not exceed 50 characters',
        'any.required': 'City is required'
    }),
});

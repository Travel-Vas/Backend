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
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioValidationSchema = void 0;
const Yup = __importStar(require("yup"));
exports.portfolioValidationSchema = Yup.object({
    banner: Yup.mixed()
        .required('Banner is required'), // You can add more specific checks if needed (e.g., for file types)
    businessName: Yup.string()
        .required('Business name is required')
        .min(3, 'Business name must be at least 3 characters long'),
    domainName: Yup.string()
        .url('Domain name must be a valid URL'),
    country: Yup.string()
        .required('Country is required')
        .min(2, 'Country must be at least 2 characters long'),
    city: Yup.string()
        .required('City is required')
        .min(2, 'City must be at least 2 characters long'),
    state: Yup.string()
        .required('State is required')
        .min(2, 'State must be at least 2 characters long'),
    whatsappNo: Yup.string()
        .matches(/^\+?[1-9]\d{1,14}$/, 'WhatsApp number must be a valid international number'),
    about: Yup.string()
        .required('About section is required')
        .min(10, 'About section must be at least 10 characters long'),
    instagram: Yup.string()
        .url('Instagram link must be a valid URL'),
    facebook: Yup.string()
        .url('Facebook link must be a valid URL'),
    twitter: Yup.string()
        .url('Twitter link must be a valid URL'),
    linkedin: Yup.string()
        .url('LinkedIn link must be a valid URL'),
    username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters long'),
});

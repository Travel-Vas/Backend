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
exports.invoiceValidationSchema = void 0;
const Yup = __importStar(require("yup"));
exports.invoiceValidationSchema = Yup.object({
    recipientName: Yup.string()
        .required('Recipient name is required')
        .min(3, 'Recipient name must be at least 3 characters long'),
    recipientEmail: Yup.string()
        .required('Recipient email is required')
        .email('Must be a valid email'),
    issuedDate: Yup.date()
        .required('Issued date is required'),
    dueDate: Yup.date()
        .required('Due date is required')
        .min(Yup.ref('issuedDate'), 'Due date must be after the issued date'),
    currency: Yup.string()
        .required('Currency is required'),
    discount: Yup.string()
        .matches(/^\d+(\.\d{1,2})?%?$/, 'Discount must be a valid percentage or number'),
    items: Yup.array().of(Yup.object({
        itemName: Yup.string()
            .required('Item name is required'),
        quantity: Yup.number()
            .required('Quantity is required')
            .min(1, 'Quantity must be at least 1'),
        time: Yup.date()
            .required('Time is required'),
        price: Yup.number()
            .required('Price is required')
            .min(0, 'Price cannot be negative'),
        totalAmount: Yup.number()
            .required('Item total is required')
            .min(0, 'Total amount cannot be negative'),
    })).min(1, 'At least one item is required'),
    totalAmount: Yup.number()
        .required('Total amount is required')
        .min(0, 'Total amount must be at least 0'),
});

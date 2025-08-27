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
const mongoose_1 = __importStar(require("mongoose"));
const constants_1 = require("../../helpers/constants");
const uuid_1 = require("uuid");
const ItemSchema = new mongoose_1.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
});
const InvoiceSchema = new mongoose_1.Schema({
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    DueDate: { type: Date, required: true },
    currency: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Currency', required: true },
    Discount: { type: Number },
    subTotal: { type: Number },
    items: { type: [ItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    invoiceNo: {
        type: String,
        default: () => `INVOICE-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`,
        unique: true,
        trim: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'User',
    },
    terms: {
        type: String,
    }
});
const InvoiceModel = mongoose_1.default.model(constants_1.INVOICE_TABLE, InvoiceSchema);
exports.default = InvoiceModel;

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
exports.CardModel = void 0;
const constants_1 = require("../../../helpers/constants");
const mongoose_1 = __importStar(require("mongoose"));
const CardSchema = new mongoose_1.default.Schema({
    cardNumber: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expirationDate: {
        type: String,
        required: true,
        trim: true
    },
    cvc: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});
CardSchema.path('cardNumber').validate(function (value) {
    return /^\d{13,19}$/.test(value.replace(/\s/g, ''));
}, 'Invalid card number format');
CardSchema.path('expirationDate').validate(function (value) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
}, 'Expiration date should be in MM/YY format');
CardSchema.path('cvc').validate(function (value) {
    return /^\d{3,4}$/.test(value);
}, 'CVC should be 3 or 4 digits');
exports.CardModel = mongoose_1.default.model(constants_1.CARD_TABLE, CardSchema);

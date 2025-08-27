"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyModel = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const CurrencySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        unique: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    exchangeRate: {
        type: Number,
        default: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
});
exports.CurrencyModel = (0, mongoose_1.model)(constants_1.CURRENCY_TABLE, CurrencySchema);

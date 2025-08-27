"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../helpers/constants");
const PricingSchema = new mongoose_1.default.Schema({
    plan: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    planCode: {
        type: String,
    },
    yearly_amount: {
        type: String,
    },
    ngAmount: {
        type: String,
    },
    ngYearAmount: {
        type: String,
    },
    features: {
        storage: {
            type: String,
            required: true,
        },
        file_size: {
            type: String,
        },
        clients: {
            type: String,
            required: true,
        },
        client_management: {
            type: String,
        },
        collaboration: {
            typr: Object
        },
        website: {
            type: String,
            required: true,
        },
        file_uploads: {
            type: String,
            required: true,
        },
    },
    stripePriceId: {
        type: String,
    },
    stripeProductId: {
        type: String,
    }
}, { timestamps: true });
const Pricing = mongoose_1.default.model(constants_1.PRICING_TABLE, PricingSchema);
exports.default = Pricing;

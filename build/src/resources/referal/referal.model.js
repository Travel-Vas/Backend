"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referalModel = void 0;
const mongoose_1 = require("mongoose");
const referal_interface_1 = require("./referal.interface");
const constants_1 = require("../../helpers/constants");
const referalSchema = new mongoose_1.Schema({
    referrer: {
        type: String,
    },
    referred: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    referralCode: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: referal_interface_1.RFStatus,
        default: referal_interface_1.RFStatus.PENDING,
        required: true,
    },
    reward: {
        type: Number,
        default: 0
    },
    redeemed: {
        type: Boolean,
        default: false
    },
    redeemedCount: {
        type: Number,
    },
    point: {
        type: Number,
        default: 10
    },
    referralsCount: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: constants_1.REFERAL_TABLE,
        },
    ]
}, {
    timestamps: true,
    optimisticConcurrency: true,
});
exports.referalModel = (0, mongoose_1.model)(constants_1.REFERAL_TABLE, referalSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomDomainModel = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const CustomDomainSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    templateCode: {
        type: String,
        trim: true
    },
    templateString: {
        type: String,
    },
    customDomain: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    portfolioId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});
CustomDomainSchema.index({ userId: 1, portfolioId: 1 });
CustomDomainSchema.index({ customDomain: 1 }, { unique: true });
CustomDomainSchema.index({ verificationStatus: 1 });
CustomDomainSchema.methods.verify = function () {
    this.verificationStatus = 'verified';
    return this.save();
};
CustomDomainSchema.methods.fail = function () {
    this.verificationStatus = 'failed';
    return this.save();
};
CustomDomainSchema.methods.activate = function () {
    this.isActive = true;
    return this.save();
};
CustomDomainSchema.methods.deactivate = function () {
    this.isActive = false;
    return this.save();
};
exports.CustomDomainModel = (0, mongoose_1.model)(constants_1.CUSTOM_DOMAIN, CustomDomainSchema);

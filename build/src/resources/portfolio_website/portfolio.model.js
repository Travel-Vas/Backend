"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const FileSchema = {
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    size: {
        type: Number,
    },
    type: {
        type: String,
    },
};
const CollectionSchema = {
    name: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    files: {
        type: [FileSchema],
    },
};
const PortfolioSchema = new mongoose_1.Schema({
    banner: {
        url: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        size: {
            type: Number
        },
        type: {
            type: String
        }
    },
    businessName: { type: String },
    description: { type: String },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    domainName: { type: String },
    country: { type: String },
    city: { type: String },
    state: { type: String },
    whatsappNo: { type: String },
    about: { type: String, required: true },
    bioImages: { type: [FileSchema], required: true },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    username: { type: String },
    accessToken: { type: String, required: true },
    collections: [CollectionSchema],
    template: String
}, { timestamps: true });
const PortfolioModel = (0, mongoose_1.model)(constants_1.PORTFOLIO_TABLE, PortfolioSchema);
exports.default = PortfolioModel;

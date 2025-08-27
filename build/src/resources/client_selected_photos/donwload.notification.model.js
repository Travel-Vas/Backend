"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../helpers/constants");
const DownloadSchema = new mongoose_1.default.Schema({
    download_count: {
        type: Number,
        required: true,
    },
    download_date: {
        type: Date,
        default: Date.now,
    },
    shoot_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Shoot",
    },
    client_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Client",
    },
});
exports.default = mongoose_1.default.model(constants_1.DOWNLOAD_TABLE, DownloadSchema);

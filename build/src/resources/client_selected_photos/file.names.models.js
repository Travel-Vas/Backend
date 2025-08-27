"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const file_nameSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "userId" },
    selected_files: [String]
}, { timestamps: true });
const file_name_model = (0, mongoose_1.model)(constants_1.SELECTED_PHOTOS, file_nameSchema);
exports.default = file_name_model;

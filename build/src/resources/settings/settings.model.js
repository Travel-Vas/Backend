"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const settingsSchema = new mongoose_1.Schema({
    domain_name: {
        type: String,
    },
    watermark_name: {
        type: String,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    watermark_font_size: {
        type: Number,
    },
    watermark_font_style: {
        type: String,
    },
    watermark_color: {
        type: String,
    },
    opacity: {
        type: Number,
    },
    watermark_url: {
        type: String,
    }
}, {
    timestamps: true
});
exports.default = (0, mongoose_1.model)(constants_1.SETTINGS_TABLE, settingsSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "name of category is required"]
    },
    cover_image: {
        type: String,
        required: [true, 'images are required'],
        default: 'default.jpg'
    }
});
exports.default = (0, mongoose_1.model)('categories', categorySchema);

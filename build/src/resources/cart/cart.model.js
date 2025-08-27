"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const options = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: "updated_at"
    }
};
const cartSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
            product_id: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: Number,
            variation: {
                color: String,
                size: String
            },
            vendor: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "users",
            }
        }],
    total_price: {
        type: Number,
        default: 0
    },
}, options);
exports.default = (0, mongoose_1.model)('carts', cartSchema);

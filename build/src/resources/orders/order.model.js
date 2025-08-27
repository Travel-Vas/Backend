"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const order_interface_1 = require("./order.interface");
const timeStamps = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: "updated_at"
    }
};
const orderItemSchema = new mongoose_1.Schema({
    product_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'products',
        required: [true, 'product id is required']
    },
    quantity: {
        type: Number,
        required: [true, 'quantity is required']
    },
    variation: {
        color: String,
        size: String
    },
    price: {
        type: Number,
        required: [true, 'price of order is required']
    },
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'product id is required']
    },
    item_shipping_status: {
        type: String,
        enum: [...Object.values(order_interface_1.OrderShippingStatus)],
        default: order_interface_1.OrderShippingStatus.PENDING
    },
    shipment_acknowledged: {
        type: Boolean,
        default: false,
    }
});
const orderSchema = new mongoose_1.Schema({
    items: {
        type: [orderItemSchema],
        required: [true, 'items is required']
    },
    customer_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'customer_id is required']
    },
    shipping_address: {
        type: String,
        required: [true, 'shipping address is required']
    },
    total_price: {
        type: Number,
        required: [true, 'total Price must be calculated']
    },
    payment_status: {
        type: String,
        enum: [...Object.values(order_interface_1.OrderPaymentStatus)],
        default: order_interface_1.OrderPaymentStatus.PENDING
    },
    shipping_status: {
        type: String,
        enum: [...Object.values(order_interface_1.OrderShippingStatus)],
        default: order_interface_1.OrderShippingStatus.PENDING
    },
    cart_id: mongoose_1.Schema.Types.ObjectId,
    shipment_acknowledged: {
        type: Boolean,
        default: false,
    }
}, timeStamps);
exports.default = (0, mongoose_1.model)('orders', orderSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemModel = void 0;
const mongoose_1 = require("mongoose");
const order_interface_1 = require("./order.interface");
const timeStamps = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: "updated_at"
    }
};
const orderItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'product id is required']
    },
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Orders2',
        required: [true, 'order id is required']
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
        ref: 'User',
        required: [true, 'product id is required']
    },
    item_shipping_status: {
        type: String,
        enum: [...Object.values(order_interface_1.OrderShippingStatus)],
        default: order_interface_1.OrderShippingStatus.PENDING
    },
});
const orderSchema = new mongoose_1.Schema({
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'customer is required']
    },
    shipping_address: {
        type: String,
        required: [true, 'shipping address is required']
    },
    total_price: {
        type: Number,
        required: [true, 'total Price must be calculated']
    },
    cart: mongoose_1.Schema.Types.ObjectId,
    payment_status: {
        type: String,
        enum: [...Object.values(order_interface_1.OrderPaymentStatus)],
        default: order_interface_1.OrderPaymentStatus.PENDING
    },
}, Object.assign({}, timeStamps));
orderSchema.virtual('items', {
    ref: 'OrderItem', // The model to populate
    localField: '_id', // The field in the User model
    foreignField: 'order', // The field in the Post model
    // justOne: false, // Set to `true` if you expect only one result, otherwise `false` for multiple results
});
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });
exports.default = (0, mongoose_1.model)('Orders2', orderSchema);
exports.OrderItemModel = (0, mongoose_1.model)('OrderItem', orderItemSchema);

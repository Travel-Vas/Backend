"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._acknowledgeShipment = exports._updateShippingStatus = exports._getCustomerOrders = exports._getVendorOrders = exports._updateOrderStatus = exports._createItemCheckout = exports._createCheckoutWithWallet = exports._createCheckout = void 0;
const mongoose_1 = require("mongoose");
const App_1 = require("../../helpers/lib/App");
const PaystackService_1 = __importDefault(require("../../helpers/lib/App/PaystackService"));
const cart_model_1 = __importDefault(require("../cart/cart.model"));
const cart_service_1 = require("../cart/cart.service");
const transactions_interface_1 = require("../transactions/transactions.interface");
const order_interface_1 = require("./order.interface");
const order_model_1 = __importDefault(require("./order.model"));
const products_model_1 = __importDefault(require("../products/products.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const transaction_model_1 = __importDefault(require("../transactions/transaction.model"));
const utils_1 = require("../../helpers/lib/App/utils");
const _createCheckout = (user_id, email) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield cart_model_1.default.findOne({ user: user_id }).populate('items.product_id');
    if (!cart || cart.items.length === 0) {
        throw new App_1.CustomError({ message: "Cart is Empty", code: 400 });
    }
    let totalAmount = 0;
    for (const item of cart.items) {
        if (item.product_id.stock < item.quantity) {
            throw new App_1.CustomError({ message: `Insufficient stock for product ${item.product_id.name}`, code: 400 });
        }
        totalAmount += item.product_id.price * item.quantity;
    }
    const orderItems = cart.items.map((item) => {
        return {
            product_id: item.product_id.id,
            price: item.product_id.price * item.quantity,
            quantity: item.quantity,
            variation: item.variation,
            vendor: item.vendor
        };
    });
    const order = new order_model_1.default(Object.assign(Object.assign({}, cart), { items: orderItems, total_price: totalAmount, cart_id: cart._id, customer_id: user_id, shipping_address: 'testing street for now' }));
    const payment = yield PaystackService_1.default.generatePaymentLink(email, Math.round(totalAmount * 100), { payment_type: transactions_interface_1.PaymentType.PURCHASE, order_id: order._id });
    yield order.save();
    return payment;
});
exports._createCheckout = _createCheckout;
const _createCheckoutWithWallet = (user_id, email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: user_id });
    if (!user)
        throw new App_1.CustomError({ message: "User not found", code: 404 });
    const cart = yield cart_model_1.default.findOne({ user: user_id }).populate('items.product_id');
    if (!cart || cart.items.length === 0) {
        throw new App_1.CustomError({ message: "Cart is Empty", code: 400 });
    }
    let totalAmount = 0;
    for (const item of cart.items) {
        if (item.product_id.stock < item.quantity) {
            throw new App_1.CustomError({ message: `Insufficient stock for product ${item.product_id.name}`, code: 400 });
        }
        totalAmount += item.product_id.price * item.quantity;
    }
    if (totalAmount > user.balance)
        throw new App_1.CustomError({ message: "Insufficient funds", code: 400 });
    const orderItems = cart.items.map((item) => {
        return {
            product_id: item.product_id.id,
            price: item.product_id.price * item.quantity,
            quantity: item.quantity,
            variation: item.variation,
            vendor: item.vendor
        };
    });
    const order = new order_model_1.default(Object.assign(Object.assign({}, cart), { items: orderItems, total_price: totalAmount, cart_id: cart._id, customer_id: user_id, shipping_address: 'testing street for now', payment_status: order_interface_1.OrderPaymentStatus.SUCCESSFUL }));
    yield order.save();
    yield transaction_model_1.default.create({
        amount: totalAmount,
        transaction_status: transactions_interface_1.TransactionStatus.SUCCESSFUL,
        transaction_type: transactions_interface_1.TransactionType.WITHDRAWAL,
        payment_type: transactions_interface_1.PaymentType.PURCHASE,
        ref: (0, utils_1.generateRandom)(),
        order_id: order._id
    });
    user.balance -= totalAmount;
    yield user.save();
    return order;
});
exports._createCheckoutWithWallet = _createCheckoutWithWallet;
const _createItemCheckout = (user_id, email, item) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield products_model_1.default.findOne({ _id: item.product_id });
    if (!product)
        throw new App_1.CustomError({ message: "product not found", code: 404 });
    if (product.stock < item.quantity)
        throw new App_1.CustomError({ message: "Quantity requested is not in stock", code: 404 });
    const totalAmount = item.quantity * product.price;
    const order = new order_model_1.default({
        customer_id: user_id,
        items: [Object.assign(Object.assign({}, item), { price: totalAmount, vendor: product.vendor })],
        total_price: totalAmount,
        shipping_address: "testing shipping address"
    });
    const payment = yield PaystackService_1.default.generatePaymentLink(email, Math.round(totalAmount * 100), { payment_type: transactions_interface_1.PaymentType.PURCHASE, order_id: order._id });
    yield order.save();
    return payment;
});
exports._createItemCheckout = _createItemCheckout;
const _updateOrderStatus = (order_id, payment_status) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findOne({ _id: order_id });
    if (!order)
        throw new App_1.CustomError({ message: "Order Not Found", code: 404 });
    order.payment_status = payment_status;
    if (order.cart_id) {
        (0, cart_service_1._emptyCart)(order.customer_id.toString());
    }
    yield order.save();
    return 'success';
});
exports._updateOrderStatus = _updateOrderStatus;
const _getVendorOrders = (vendorId, shippingStatus) => __awaiter(void 0, void 0, void 0, function* () {
    const match = {
        'items.vendor': new mongoose_1.Types.ObjectId(vendorId)
    };
    if (shippingStatus)
        match['items.item_shipping_status'] = shippingStatus;
    console.log(match);
    try {
        const orders = yield order_model_1.default.aggregate([
            // Unwind the items array to work with individual items
            { $unwind: '$items' },
            // Match orders based on vendor ID and item shipping status
            {
                $lookup: {
                    from: 'products', // The collection name in MongoDB (not the model name)
                    localField: 'items.product_id',
                    foreignField: '_id',
                    as: 'items.product_details'
                }
            },
            { $unwind: '$items.product_details' },
            {
                $match: {
                    'items.vendor': new mongoose_1.Types.ObjectId(vendorId),
                    // 'items.item_shipping_status': shippingStatus
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            // Unwind the customer array to get the object instead of an array
            { $unwind: '$customer' },
            // Group the items back into the original order structure
            {
                $project: {
                    shipping_status: 1,
                    customer: {
                        email: 1,
                        full_name: 1,
                        // phone: 1
                    },
                    shipping_address: 1,
                    total_price: 1,
                    payment_status: 1,
                    cart_id: 1,
                    // items: 1,
                    'items._id': 1,
                    'items.product_id': 1,
                    'items.quantity': 1,
                    'items.price': 1,
                    'items.vendor': 1,
                    'items.item_shipping_status': 1,
                    'items.shipment_acknowledged': 1,
                    'items.product_details._id': 1,
                    'items.product_details.name': 1, // Include specific fields from product
                    'items.product_details.price': 1,
                    'items.product_details.images': 1,
                    'items.product_details.rating': 1,
                    created_at: 1,
                    updated_at: 1,
                    shipment_acknowledged: 1,
                }
            },
            {
                $group: {
                    _id: '$_id',
                    customer: { $first: '$customer' },
                    shipping_address: { $first: '$shipping_address' },
                    // total_price: { $first: '$total_price' },
                    payment_status: { $first: '$payment_status' },
                    shipping_status: { $first: '$shipping_status' },
                    // cart_id: { $first: '$cart_id' },
                    items: { $push: '$items' },
                    created_at: { $first: '$created_at' },
                    updated_at: { $first: '$updated_at' },
                    shipment_acknowledged: { $first: '$shipment_acknowledged' }
                }
            },
        ]);
        return orders;
    }
    catch (error) {
        console.error('Error fetching vendor orders:', error);
        throw error;
    }
});
exports._getVendorOrders = _getVendorOrders;
const _getCustomerOrders = (customer_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield order_model_1.default.find({ customer_id }).populate({ path: 'items.product_id', select: "name images description rating" });
});
exports._getCustomerOrders = _getCustomerOrders;
const _updateShippingStatus = (order_id, vendor_id, shipping_status) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findOne({ _id: order_id });
    let updatedCount = 0;
    if (!order)
        throw new App_1.CustomError({ message: "Order not Found", code: 404 });
    if (order.shipping_status == order_interface_1.OrderShippingStatus.DELIVERED)
        throw new App_1.CustomError({ message: "Already Delivered", code: 400 });
    const updatedItems = order.items.map((item) => {
        if (item.vendor.toString() == vendor_id) {
            updatedCount++;
            return Object.assign(Object.assign({}, item), { item_shipping_status: shipping_status });
        }
        return item;
    });
    order.items = updatedItems;
    if (updatedCount == order.items.length) {
        order.shipping_status = shipping_status;
    }
    //send user notification
    yield order.save();
    return order;
});
exports._updateShippingStatus = _updateShippingStatus;
const _acknowledgeShipment = (user_id, order_id, vendor_id) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findOne({ _id: order_id, customer_id: user_id, shipment_acknowledged: false });
    let updatedCount = 0;
    let totalAmount = 0;
    let vendor = vendor_id;
    if (!order)
        throw new App_1.CustomError({ message: "Order not Found", code: 404 });
    const updatedItems = order.items.map((item) => {
        if (vendor_id) {
            if (item.vendor.toString() == vendor_id) {
                updatedCount++;
                totalAmount += item.price;
                return Object.assign(Object.assign({}, item), { shipment_acknowledged: true });
            }
            else {
                return item;
            }
        }
        totalAmount += item.price;
        return Object.assign(Object.assign({}, item), { shipment_acknowledged: true });
    });
    order.items = updatedItems;
    if (updatedCount == order.items.length) {
        order.shipment_acknowledged = true;
    }
    if (updatedCount == 0)
        order.shipment_acknowledged = true;
    if (!vendor_id) {
        vendor = order.items[0].vendor.toString();
    }
    const vendorDetails = yield user_model_1.default.findOne({ _id: vendor });
    if (!vendorDetails)
        throw new App_1.CustomError({ message: "Vendor not found", code: 404 });
    yield order.save();
    console.log(totalAmount);
    yield transaction_model_1.default.create({
        amount: totalAmount,
        transaction_status: transactions_interface_1.TransactionStatus.SUCCESSFUL,
        transaction_type: transactions_interface_1.TransactionType.DEPOSIT,
        payment_type: transactions_interface_1.PaymentType.PURCHASE,
        ref: (0, utils_1.generateRandom)(),
        order_id: order._id,
        user_id: vendor
    });
    vendorDetails.balance += totalAmount;
    yield vendorDetails.save();
    return order;
});
exports._acknowledgeShipment = _acknowledgeShipment;

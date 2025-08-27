"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports._updateShippingStatus = exports._getCustomerOrders = exports._getVendorOrders = exports._updateOrderStatus = exports._createItemCheckout = exports._createCheckoutWithWallet = exports._createCheckout = void 0;
const App_1 = require("../../helpers/lib/App");
const PaystackService_1 = __importDefault(require("../../helpers/lib/App/PaystackService"));
const cart_model_1 = __importDefault(require("../cart/cart.model"));
const cart_service_1 = require("../cart/cart.service");
const transactions_interface_1 = require("../transactions/transactions.interface");
const order_interface_1 = require("./order.interface");
const order2_model_1 = __importStar(require("./order2.model"));
const products_model_1 = __importDefault(require("../products/products.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const transaction_model_1 = __importDefault(require("../transactions/transaction.model"));
const utils_1 = require("../../helpers/lib/App/utils");
const _createCheckout = (user_id, email, shipping_address) => __awaiter(void 0, void 0, void 0, function* () {
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
    const order = new order2_model_1.default(Object.assign(Object.assign({}, cart), { total_price: totalAmount, cart: cart._id, customer: user_id, shipping_address }));
    const orderItems = cart.items.map((item) => {
        return {
            product: item.product_id.id,
            price: item.product_id.price * item.quantity,
            quantity: item.quantity,
            variation: item.variation,
            vendor: item.vendor,
            order: order._id
        };
    });
    yield order2_model_1.OrderItemModel.create(orderItems);
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
            product: item.product_id.id,
            price: item.product_id.price * item.quantity,
            quantity: item.quantity,
            variation: item.variation,
            vendor: item.vendor,
            order: order._id
        };
    });
    const order = new order2_model_1.default(Object.assign(Object.assign({}, cart), { total_price: totalAmount, cart: cart._id, customer: user_id, shipping_address: 'testing street for now', payment_status: order_interface_1.OrderPaymentStatus.SUCCESSFUL }));
    yield order.save();
    yield order2_model_1.OrderItemModel.create(orderItems);
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
    const product = yield products_model_1.default.findOne({ _id: item.product });
    if (!product)
        throw new App_1.CustomError({ message: "product not found", code: 404 });
    if (product.stock < item.quantity)
        throw new App_1.CustomError({ message: "Quantity requested is not in stock", code: 404 });
    const totalAmount = item.quantity * product.price;
    const order = new order2_model_1.default({
        customer: user_id,
        total_price: totalAmount,
        shipping_address: "testing shipping address"
    });
    yield order2_model_1.OrderItemModel.create(Object.assign(Object.assign({}, item), { price: totalAmount, vendor: product.vendor, order: order._id }));
    const payment = yield PaystackService_1.default.generatePaymentLink(email, Math.round(totalAmount * 100), { payment_type: transactions_interface_1.PaymentType.PURCHASE, order_id: order._id });
    yield order.save();
    return payment;
});
exports._createItemCheckout = _createItemCheckout;
const _updateOrderStatus = (order_id, payment_status) => __awaiter(void 0, void 0, void 0, function* () {
    // const order = await order2Model.findOne({ _id: order_id }).populate('items')
    const order = yield order2_model_1.default.findOne({ _id: order_id })
        .populate({
        path: 'items',
        populate: [
            { path: 'product', model: 'Product' },
            { path: 'vendor', model: 'User' }
        ]
    })
        .populate('customer', 'full_name email'); // Populate the customer field
    if (!order)
        throw new App_1.CustomError({ message: "Order Not Found", code: 404 });
    order.payment_status = payment_status;
    if (order.cart) {
        (0, cart_service_1._emptyCart)(order.customer._id.toString());
    }
    if (payment_status == order_interface_1.OrderPaymentStatus.SUCCESSFUL) {
        //fire fund vendor wallet
        for (const item of order.items) {
            yield user_model_1.default.findOneAndUpdate({ _id: item.vendor._id }, { $inc: { balance: item.price } });
            yield transaction_model_1.default.create({
                amount: item.price,
                transaction_status: transactions_interface_1.TransactionStatus.SUCCESSFUL,
                transaction_type: transactions_interface_1.TransactionType.DEPOSIT,
                payment_type: transactions_interface_1.PaymentType.PURCHASE,
                ref: (0, utils_1.generateRandom)(),
                order_id: order._id,
                user_id: item.vendor._id
            });
        }
        //send receipt to customer
        const customer_purchase_items = order.items.map((item) => {
            return {
                name: item.product.name,
                price: item.product.price,
                qty: item.quantity,
                total: item.price,
            };
        });
        yield new App_1.EmailService().purchase_receipt("Payment Received", order.customer.email, order.customer.full_name, order._id, customer_purchase_items, order.total_price);
    }
    yield order.save();
    return 'success';
});
exports._updateOrderStatus = _updateOrderStatus;
const _getVendorOrders = (vendorId, shippingStatus) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order2_model_1.OrderItemModel.find({ vendor: vendorId }).populate({ path: "product", select: "name images" });
        const mapped = yield Promise.all(orders.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const order = yield order2_model_1.default.findById(item.order).populate({ path: "customer", select: "full_name profile_image" });
            return {
                product: item.product,
                quantity: item.quantity,
                total_price: item.price,
                customer: order === null || order === void 0 ? void 0 : order.customer,
                shipping_status: item.item_shipping_status,
                order_id: item._id,
                shipping_address: order === null || order === void 0 ? void 0 : order.shipping_address
            };
        })));
        return mapped;
    }
    catch (error) {
        console.error('Error fetching vendor orders:', error);
        throw error;
    }
});
exports._getVendorOrders = _getVendorOrders;
const _getCustomerOrders = (customer_id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield order2_model_1.default.find({ customer: customer_id }).populate({
        path: 'items',
        populate: {
            path: 'product',
            model: 'Product',
            select: "name images",
        }
    });
});
exports._getCustomerOrders = _getCustomerOrders;
const _updateShippingStatus = (order_id, vendor_id, shipping_status) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order2_model_1.OrderItemModel.findOneAndUpdate({ _id: order_id, vendor: vendor_id }, { item_shipping_status: shipping_status });
    if (!order)
        throw new App_1.CustomError({ message: "Not Found", code: 404 });
    return order;
});
exports._updateShippingStatus = _updateShippingStatus;

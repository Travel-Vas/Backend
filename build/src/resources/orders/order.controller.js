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
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingController = exports.acknowledgeShipmentController = exports.updateShippingStatusController = exports.getCustomerOrdersController = exports.getVendorOrdersController = exports.createItemCheckoutController = exports.createCheckoutController = void 0;
const App_1 = require("../../helpers/lib/App");
const order_service_1 = require("./order.service");
const order2_service_1 = require("./order2.service");
const order_interface_1 = require("./order.interface");
const createCheckoutController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { payment_option } = req.query;
    if (!payment_option)
        throw new App_1.CustomError({ message: "payment_option is required. pg or wallet", code: 400 });
    let data;
    if (payment_option == 'pg') {
        data = yield (0, order2_service_1._createCheckout)(req.user._id, req.user.email, req.body.shipping_address);
    }
    else if (payment_option == 'wallet') {
        data = yield (0, order_service_1._createCheckoutWithWallet)(req.user._id, req.user.email);
    }
    else {
        throw new App_1.CustomError({ message: "payment_option is required. pg or wallet", code: 400 });
    }
    res.status(201).json({ data, msg: 'successful' });
});
exports.createCheckoutController = createCheckoutController;
const createItemCheckoutController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { payment_option } = req.query
    // if (!payment_option) throw new CustomError({ message: "payment option is required", code: 400 });
    const data = yield (0, order2_service_1._createItemCheckout)(req.user._id, req.user.email, req.body);
    res.status(201).json({ data, msg: 'successful' });
});
exports.createItemCheckoutController = createItemCheckoutController;
const getVendorOrdersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, order2_service_1._getVendorOrders)(req.user._id);
    res.status(200).json({ data, msg: 'successful' });
});
exports.getVendorOrdersController = getVendorOrdersController;
const getCustomerOrdersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, order2_service_1._getCustomerOrders)(req.user._id);
    res.status(200).json({ data, msg: 'successful' });
});
exports.getCustomerOrdersController = getCustomerOrdersController;
const updateShippingStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, order2_service_1._updateShippingStatus)(req.body.order_id, req.user._id, req.body.shipping_status);
    res.status(200).json({ data, msg: "Successful" });
});
exports.updateShippingStatusController = updateShippingStatusController;
const acknowledgeShipmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, order_service_1._acknowledgeShipment)(req.user._id, req.body.order_id, req.body.vendor_id);
    res.status(200).json({ data, msg: "Successful" });
});
exports.acknowledgeShipmentController = acknowledgeShipmentController;
const testingController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, order2_service_1._updateOrderStatus)(req.body.order_id, order_interface_1.OrderPaymentStatus.SUCCESSFUL);
    res.status(200).json({ data: "successful" });
});
exports.testingController = testingController;

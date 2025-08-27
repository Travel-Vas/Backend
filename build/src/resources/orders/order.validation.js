"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeShipmentSchema = exports.updateShipmentSchema = exports.createItemCheckoutSchema = exports.createCheckoutSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const order_interface_1 = require("./order.interface");
exports.createCheckoutSchema = joi_1.default.object({
    shipping_address: joi_1.default.string().required()
});
exports.createItemCheckoutSchema = joi_1.default.object({
    product: joi_1.default.string().required(),
    quantity: joi_1.default.number().default(1).min(0),
    variation: joi_1.default.object()
});
exports.updateShipmentSchema = joi_1.default.object({
    order_id: joi_1.default.string().required(),
    shipping_status: joi_1.default.string().valid(...Object.values(order_interface_1.OrderShippingStatus)).required()
});
exports.acknowledgeShipmentSchema = joi_1.default.object({
    order_id: joi_1.default.string().required(),
    vendor_id: joi_1.default.string(),
});

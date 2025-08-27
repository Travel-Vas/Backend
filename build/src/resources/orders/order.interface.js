"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderShippingStatus = exports.OrderPaymentStatus = void 0;
var OrderPaymentStatus;
(function (OrderPaymentStatus) {
    OrderPaymentStatus["PENDING"] = "pending";
    OrderPaymentStatus["SUCCESSFUL"] = "successful";
})(OrderPaymentStatus || (exports.OrderPaymentStatus = OrderPaymentStatus = {}));
var OrderShippingStatus;
(function (OrderShippingStatus) {
    OrderShippingStatus["PENDING"] = "pending";
    OrderShippingStatus["SHIPPED"] = "shipped";
    OrderShippingStatus["ON_HOLD"] = "on hold";
    OrderShippingStatus["DELIVERED"] = "delivered";
})(OrderShippingStatus || (exports.OrderShippingStatus = OrderShippingStatus = {}));

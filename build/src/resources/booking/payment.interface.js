"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentType = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCESS"] = "success";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["ABANDONED"] = "abandoned";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["FULL"] = "full";
    PaymentType["INSTALLMENT"] = "installment";
})(PaymentType || (exports.PaymentType = PaymentType = {}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.TransactionType = exports.PaymentType = void 0;
var PaymentType;
(function (PaymentType) {
    PaymentType["TRANSFER"] = "transfer";
    PaymentType["BONUS"] = "bonus";
    PaymentType["PURCHASE"] = "purchase";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAWAL"] = "withdrawal";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["DECLINED"] = "declined";
    TransactionStatus["SUCCESSFUL"] = "successful";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));

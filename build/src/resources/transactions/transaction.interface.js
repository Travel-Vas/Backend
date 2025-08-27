"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageTypes = exports.TxnStatus = void 0;
var TxnStatus;
(function (TxnStatus) {
    TxnStatus["PENDING"] = "PENDING";
    TxnStatus["PROCESSING"] = "PROCESSING";
    TxnStatus["COMPLETED"] = "COMPLETED";
    TxnStatus["FAILED"] = "FAILED";
    TxnStatus["REFUNDED"] = "REFUNDED";
    TxnStatus["CANCELLED"] = "CANCELLED";
    TxnStatus["REQUIRES_ACTION"] = "REQUIRES_ACTION";
    TxnStatus["DISPUTED"] = "DISPUTED";
})(TxnStatus || (exports.TxnStatus = TxnStatus = {}));
var PackageTypes;
(function (PackageTypes) {
    PackageTypes["EXTRA_PHOTOS"] = "EXTRA_PHOTOS";
    PackageTypes["EDITED_PHOTOS"] = "EDITED_PHOTOS";
    PackageTypes["CREDIT_WALLET"] = "Credit Wallet";
})(PackageTypes || (exports.PackageTypes = PackageTypes = {}));

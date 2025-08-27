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
exports.getUserReferalRecordAnalyticsController = exports.referralRecordsAnalytics = exports.waitdrawals = exports.getTransaction = exports.allTransactions = exports.paymentAnalysis = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const payment_service_1 = require("./payment.service");
const admin_service_1 = require("../admin.service");
const paymentAnalysis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, payment_service_1.paymentAnalysisService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.paymentAnalysis = paymentAnalysis;
const allTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.query.filter;
    const response = yield (0, payment_service_1.transactionsService)(filter);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.allTransactions = allTransactions;
const getTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const txnId = req.params.txnId;
    const response = yield (0, payment_service_1.transactionService)(txnId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.getTransaction = getTransaction;
const waitdrawals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = req.query.filter || "withdrawal";
    const response = yield (0, payment_service_1.waitdrawalsService)(filter);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.waitdrawals = waitdrawals;
const referralRecordsAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, admin_service_1.referralRecordsAnalyticsService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.referralRecordsAnalytics = referralRecordsAnalytics;
const getUserReferalRecordAnalyticsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.id;
    const response = yield (0, admin_service_1.getUserReferralAnalytics)(userId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.getUserReferalRecordAnalyticsController = getUserReferalRecordAnalyticsController;

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
exports.waitdrawalsService = exports.transactionService = exports.transactionsService = exports.paymentAnalysisService = void 0;
const transaction_model_1 = require("../../transactions/transaction.model");
const transaction_interface_1 = require("../../transactions/transaction.interface");
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const subscription_model_1 = __importDefault(require("../../subscription/subscription.model"));
const wallet_model_1 = require("../../wallet/wallet.model");
const total_revenue_1 = require("../total_revenue");
const paymentAnalysisService = () => __awaiter(void 0, void 0, void 0, function* () {
    const depositPromise = yield transaction_model_1.TransactionModel.find({
        transactionType: "deposit"
    }).countDocuments().lean().exec();
    const totalRevenue = yield (0, total_revenue_1.calculateTotalRevenue)();
    const withdrawalPromise = yield transaction_model_1.TransactionModel.find({
        transactionType: "withdrawal"
    }).countDocuments().lean().exec();
    const pendingTxnPromise = yield transaction_model_1.TransactionModel.find({
        txnStatus: transaction_interface_1.TxnStatus.PENDING
    }).countDocuments().lean().exec();
    const subscriptionPromise = yield subscription_model_1.default.aggregate([
        {
            $lookup: {
                from: 'pricings', // make sure this matches the collection name of your PricingModel (usually plural and lowercase)
                localField: 'pricingId',
                foreignField: '_id',
                as: 'pricing'
            }
        },
        {
            $unwind: '$pricing'
        },
        {
            $group: {
                _id: '$pricing.plan', // group by plan name (e.g., Free, Starter, Pro)
                totalSubscriptions: { $sum: 1 }
            }
        },
        {
            $sort: { totalSubscriptions: -1 }
        }
    ]);
    const groupedResultPromise = yield subscription_model_1.default.countDocuments().lean().exec();
    const redemedPointsPromise = (0, total_revenue_1.getRedeemedReferralsWithUserDetails)();
    const payAsYouGoPromise = yield subscription_model_1.default.find({
        storageSize: { $ne: null },
        pgSpace: { $ne: null }
    }).sort({ createdAt: -1 }).populate("userId").lean().exec();
    const transactionsResponse = yield transaction_model_1.TransactionModel.find({
        transactionType: "withdrawal"
    }).lean().exec();
    // Calculate total withdrawals
    const totalWithdrawals = transactionsResponse
        .filter(transaction => transaction.transactionType === 'withdrawal')
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    const walletTrackingPromise = yield wallet_model_1.WalletModel.find().populate("userId").sort({ "createdAt": -1 }).lean().exec();
    const totalEarnedPromise = yield wallet_model_1.WalletModel.aggregate([
        {
            $lookup: {
                from: "transactions", // collection name for TransactionModel
                localField: "userId",
                foreignField: "userId",
                as: "transactions"
            }
        },
        {
            $lookup: {
                from: "users", // collection name for User model
                localField: "userId",
                foreignField: "_id",
                as: "userId"
            }
        },
        {
            $unwind: { path: "$userId", preserveNullAndEmptyArrays: true }
        },
        {
            $addFields: {
                totalEarned: { $sum: "$transactions.amount" } // adjust field name as needed
            }
        },
        { $sort: { createdAt: -1 } }
    ]);
    const [deposite, withdrawal, pendingTxn, totalRevenues, subscription, groupedResult, redemedPoints, payAsYouGo, walletTracking, totalEarned] = yield Promise.all([
        depositPromise,
        withdrawalPromise,
        pendingTxnPromise,
        totalRevenue,
        subscriptionPromise,
        groupedResultPromise,
        redemedPointsPromise,
        payAsYouGoPromise,
        walletTrackingPromise,
        totalEarnedPromise,
    ]);
    return {
        deposit: deposite,
        payouts: withdrawal,
        pendingTransactions: pendingTxn,
        totalRevenue: totalRevenues,
        subscription: subscription,
        totalSubscription: groupedResult,
        redemedPoints: redemedPoints,
        payasyougo: payAsYouGo,
        walletTracking: walletTracking,
        totalEarned: totalEarned,
        totalWithdrawals: transactionsResponse.length
    };
});
exports.paymentAnalysisService = paymentAnalysisService;
const transactionsService = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    if (filter) {
        const response = yield transaction_model_1.TransactionModel.find({
            txnStatus: filter.toUpperCase(),
        }).lean().exec();
        return response;
    }
    const response = yield transaction_model_1.TransactionModel.find({
        limit: 50,
    }).lean().exec();
    return response;
});
exports.transactionsService = transactionsService;
const transactionService = (txnId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!txnId) {
        throw new App_1.CustomError({
            message: 'Txn Id is missing',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield transaction_model_1.TransactionModel.findOne({
        _id: txnId
    }).lean().exec();
    return response;
});
exports.transactionService = transactionService;
const waitdrawalsService = (filter) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield transaction_model_1.TransactionModel.find({
        transactionType: filter
    }).lean().exec();
    return response;
});
exports.waitdrawalsService = waitdrawalsService;

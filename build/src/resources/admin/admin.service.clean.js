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
exports.getUserReferralAnalytics = exports.assignPlanService = exports.referralRecordsAnalyticsService = exports.walletTrackingService = exports.payAsYouGoService = exports.singleSubscriptionBreakDownService = exports.subscriptionBreakDownService = exports.photographersTransactionsService = exports.clientCollectionDetailsService = exports.clientsCollectionsService = exports.clientsListService = exports.PhotographersProfileService = exports.AllPhotographersService = exports.PhotographersService = exports.DashboardService = void 0;
const App_1 = require("../../helpers/lib/App");
const user_model_1 = __importDefault(require("../users/user.model"));
const user_model_2 = __importDefault(require("../users/user.model"));
const constants_1 = require("../../helpers/constants");
const transaction_model_1 = require("../transactions/transaction.model");
const wallet_model_1 = require("../wallet/wallet.model");
const billing_model_1 = require("../payment/billing.model");
const http_status_codes_1 = require("http-status-codes");
// import {calculateTotalRevenueByUserId, calculateTotalRevenueWithAggregation} from "./total_revenue";
// All models that are causing errors are commented out
// import ClientsModel from "../clients/clients.model";
// import {CLIENT_STATUS} from "../clients/clients.interface";
// import CollectionModel from "../collection/collection.model";
// import {ShootsModel} from "../photoshoots/shoots.model";
// import SubscriptionModel from "../subscription/subscription.model";
// import PortfolioModel from "../portfolio_website/portfolio.model";
// import {referalModel} from "../referal/referal.model";
// import {disUsageService} from "../photoshoots/shoots.service";
// import PricingModel from "../subscription/pricing.model";
const DashboardService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const photographers = yield user_model_1.default.countDocuments({
            role: constants_1.UserRole.PHOTOGRAPHER
        });
        return {
            photographers,
            activeClients: 0, // Placeholder since ClientsModel is not available
            revenue: 0,
            newCustomer: [],
            pendingPayment: [],
            completedPayment: [],
            failedPayment: []
        };
    }
    catch (error) {
        console.error('Dashboard service error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch dashboard data',
            code: error.code || 500,
        });
    }
});
exports.DashboardService = DashboardService;
const PhotographersService = () => __awaiter(void 0, void 0, void 0, function* () {
    const photographers = yield user_model_2.default.countDocuments({
        role: constants_1.UserRole.PHOTOGRAPHER
    });
    const activePhotographers = yield user_model_2.default.countDocuments({
        last_login: { $gte: new Date().getMonth() - 1 },
        role: constants_1.UserRole.PHOTOGRAPHER
    });
    const inactivePhotographers = yield user_model_2.default.countDocuments({
        last_login: { $lt: new Date().getMonth() - 1 },
        role: constants_1.UserRole.PHOTOGRAPHER
    });
    return {
        photographers,
        activePhotographers,
        inactivePhotographers
    };
});
exports.PhotographersService = PhotographersService;
const AllPhotographersService = () => __awaiter(void 0, void 0, void 0, function* () {
    const photographers = yield user_model_2.default.find({
        role: constants_1.UserRole.PHOTOGRAPHER
    }).select("-password").sort({
        created_at: -1,
    }).lean().exec();
    // Return photographers without portfolio data since PortfolioModel is not available
    return photographers;
});
exports.AllPhotographersService = AllPhotographersService;
const PhotographersProfileService = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield user_model_2.default.findOne({
        _id: user_id
    }).select("-password")
        .populate("referralCode", "referralsCount referralCode")
        .lean().exec();
    return {
        profile: profile,
        totalClient: 0,
        totalCollection: 0,
        revenue: 0,
        payouts: [],
        subscription: null,
        diskUsage: 0
    };
});
exports.PhotographersProfileService = PhotographersProfileService;
const clientsListService = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    return []; // Return empty array since ClientsModel is not available
});
exports.clientsListService = clientsListService;
const clientsCollectionsService = (user_id, client_id) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        profile: null,
        shoots: []
    };
});
exports.clientsCollectionsService = clientsCollectionsService;
const clientCollectionDetailsService = (userId, shoot_id) => __awaiter(void 0, void 0, void 0, function* () {
    return null; // Return null since ShootsModel is not available
});
exports.clientCollectionDetailsService = clientCollectionDetailsService;
const photographersTransactionsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield transaction_model_1.TransactionModel.find({
            userId: userId
        })
            .populate("clientId", "name email")
            .populate("userId", "name email business_name role")
            .lean()
            .exec();
        return response;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.photographersTransactionsService = photographersTransactionsService;
const subscriptionBreakDownService = () => __awaiter(void 0, void 0, void 0, function* () {
    return []; // Return empty array since SubscriptionModel is not available
});
exports.subscriptionBreakDownService = subscriptionBreakDownService;
const singleSubscriptionBreakDownService = (Id) => __awaiter(void 0, void 0, void 0, function* () {
    return null;
});
exports.singleSubscriptionBreakDownService = singleSubscriptionBreakDownService;
const payAsYouGoService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return [];
});
exports.payAsYouGoService = payAsYouGoService;
const walletTrackingService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let walletPromise;
        if (id) {
            walletPromise = yield wallet_model_1.WalletModel.findById(id).populate("userId", "email business_name prifile_image role business_address business_city business_country business_state").lean().exec();
            if (!walletPromise) {
                throw new App_1.CustomError({
                    message: 'Wallet not found',
                    code: 404,
                });
            }
            walletPromise = [walletPromise];
        }
        else {
            walletPromise = yield wallet_model_1.WalletModel.find().populate("userId", "email business_name prifile_image role business_address business_city business_country business_state").lean().exec();
        }
        const userWalletData = [];
        for (const wallet of walletPromise) {
            const actualUserId = wallet.userId._id || wallet.userId;
            const transactionsResponse = yield transaction_model_1.TransactionModel.find({
                userId: actualUserId,
            }).lean().exec();
            const totalWithdrawals = transactionsResponse
                .filter(transaction => transaction.transactionType === 'withdrawal')
                .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
            const totalAmount = transactionsResponse
                .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
            const billingDetails = yield billing_model_1.BillingModel.findOne({
                userId: actualUserId
            }).lean().exec();
            userWalletData.push({
                userId: actualUserId,
                userDetails: wallet.userId,
                walletId: wallet._id,
                wallet: wallet,
                billingDetails: billingDetails,
                totalWithdrawals: totalWithdrawals,
                totalAmount: totalAmount,
                transactionCount: transactionsResponse.length,
                transactions: transactionsResponse
            });
        }
        if (id) {
            return {
                success: true,
                data: userWalletData[0],
                walletId: id
            };
        }
        return {
            success: true,
            data: userWalletData,
            summary: {
                totalUsers: userWalletData.length,
                overallWithdrawals: userWalletData.reduce((sum, user) => sum + user.totalWithdrawals, 0),
                overallTotalAmount: userWalletData.reduce((sum, user) => sum + user.totalAmount, 0),
                usersWithBilling: userWalletData.filter(user => user.billingDetails).length,
                usersWithoutBilling: userWalletData.filter(user => !user.billingDetails).length
            }
        };
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.walletTrackingService = walletTrackingService;
const referralRecordsAnalyticsService = () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        success: true,
        data: {
            globalStats: {
                totalReferrals: 0,
                totalPointsEarned: 0,
                totalPointsRedeemed: 0,
                totalAmountCredited: 0
            },
            userAnalytics: []
        }
    };
});
exports.referralRecordsAnalyticsService = referralRecordsAnalyticsService;
const assignPlanService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    throw new App_1.CustomError({
        message: "Plan assignment service unavailable - missing subscription models",
        code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE
    });
});
exports.assignPlanService = assignPlanService;
const getUserReferralAnalytics = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, userReferralCode = null) {
    return {
        success: true,
        data: {
            userId,
            totalReferrals: 0,
            totalPointsEarned: 0,
            totalPointsRedeemed: 0,
            totalAmountCredited: 0,
            availablePoints: 0,
            referralRecords: [],
            referrerDetails: null,
            subscriptionPlan: null
        }
    };
});
exports.getUserReferralAnalytics = getUserReferralAnalytics;

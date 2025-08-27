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
// import ClientsModel from "../clients/clients.model";
// import {CLIENT_STATUS} from "../clients/clients.interface";
const transaction_model_1 = require("../transactions/transaction.model");
// import CollectionModel from "../collection/collection.model";
// import {ShootsModel} from "../photoshoots/shoots.model";
// import SubscriptionModel from "../subscription/subscription.model";
// import PortfolioModel from "../portfolio_website/portfolio.model";
const wallet_model_1 = require("../wallet/wallet.model");
const billing_model_1 = require("../payment/billing.model");
// import {referalModel} from "../referal/referal.model";
const http_status_codes_1 = require("http-status-codes");
// import PricingModel from "../subscription/pricing.model";
const DashboardService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Count photographers
        const photographers = yield user_model_1.default.countDocuments({
            role: constants_1.UserRole.PHOTOGRAPHER
        });
        // Return simplified dashboard data
        return {
            photographers,
            activeClients: 0,
            revenue: 0,
            newCustomer: [],
            pendingPayment: [],
            completedPayment: [],
            failedPayment: []
        };
        // Original code commented out - using simplified version above
        // const revenuePromise =  calculateTotalRevenueWithAggregation
        // const pendingPayments = TransactionModel.find({
        //     txnStatus: TxnStatus.PENDING
        // }).lean().exec()
        // ... rest of original code commented out
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
    const photographersPromise = yield user_model_2.default.countDocuments({
        role: constants_1.UserRole.PHOTOGRAPHER
    });
    const activePhotographersPromise = yield user_model_2.default.countDocuments({
        last_login: { $gte: new Date().getMonth() - 1 },
        role: constants_1.UserRole.PHOTOGRAPHER
    });
    const inactivePhotographersPromise = yield user_model_2.default.countDocuments({
        last_login: { $lt: new Date().getMonth() - 1 },
        role: constants_1.UserRole.PHOTOGRAPHER
    });
    const [photographers, activePhotographers, inactivePhotographers] = yield Promise.all([
        photographersPromise,
        activePhotographersPromise,
        inactivePhotographersPromise
    ]);
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
    // Simplified - return photographers without portfolio data
    // Original code commented out due to missing PortfolioModel
    // const photographersWithPortfolios = await Promise.all(
    //     photographers.map(async (photographer) => {
    //         const portfolio = await PortfolioModel.findOne({
    //             userId: photographer._id
    //         }).select("city country state whatsappNo").lean().exec();
    //         return {
    //             ...photographer,
    //             portfolio: portfolio || null
    //         };
    //     })
    // );
    return photographers;
});
exports.AllPhotographersService = AllPhotographersService;
const PhotographersProfileService = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield user_model_2.default.findOne({
        _id: user_id
    }).select("-password")
        .populate("referralCode", "referralsCount referralCode")
        .lean().exec();
    // Simplified version - commenting out missing services
    // const diskUsagePromise = await disUsageService(user_id)
    // const subscriptionPlan = await SubscriptionModel.findOne({
    //     userId: user_id
    // }).populate("pricingId").lean().exec();
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
    // const clientsPromise = await ClientsModel.find({
    //     user_id: user_id
    // }).lean().exec();
    // return clientsPromise
    return []; // Return empty array since ClientsModel is not available
});
exports.clientsListService = clientsListService;
const clientsCollectionsService = (user_id, client_id) => __awaiter(void 0, void 0, void 0, function* () {
    // const clientProfilePromise = await ClientsModel.findOne({
    //     user_id: user_id,
    //     _id: client_id
    // }).lean().exec();
    // const shootsPromise = await ShootsModel.find({
    //     user_id: user_id,
    //     client_id: client_id,
    // }).lean().exec();
    // const [clientProfile, shoots] = await Promise.all([
    //     clientProfilePromise,
    //     shootsPromise
    // ])
    return {
        profile: null,
        shoots: []
    };
});
exports.clientsCollectionsService = clientsCollectionsService;
const clientCollectionDetailsService = (userId, shoot_id) => __awaiter(void 0, void 0, void 0, function* () {
    // const shootsPromise = await ShootsModel.findOne({
    //     user_id: userId,
    //     _id: shoot_id,
    // }).lean().exec();
    // return shootsPromise
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
    try {
        // const buildFilter = (filterParams:any) => {
        //     const filter:any = {};
        //
        //     if (filterParams.plan) {
        //         filter.plicingId.plan = filterParams.plan;
        //     }
        //
        //     // Add other filters as needed
        //     if (filterParams.status) {
        //         filter.status = filterParams.status;
        //     }
        //
        //     return filter;
        // };
        // const filters = buildFilter(filter);
        const response = yield SubscriptionModel.find()
            .populate([
            {
                path: "userId",
                select: "-password -__v"
            },
            {
                path: "pricingId",
                select: "plan amount yearly_amount ngYearAmount ngAmount"
            }
        ])
            .lean()
            .exec();
        return response;
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.subscriptionBreakDownService = subscriptionBreakDownService;
const singleSubscriptionBreakDownService = (Id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield SubscriptionModel.findOne({
            _id: Id
        })
            .populate([
            {
                path: "userId",
                select: "-password -__v"
            },
            {
                path: "planId", // if you have other refs
                select: "name price"
            }
        ])
            .lean()
            .exec();
        return response;
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.singleSubscriptionBreakDownService = singleSubscriptionBreakDownService;
const payAsYouGoService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (id) {
            const response = yield SubscriptionModel.findOne({
                _id: id,
                $or: [
                    {
                        storageSize: { $ne: '' },
                        pgSpace: { $ne: '' }
                    }
                ]
            })
                .populate("userId")
                .populate("pricingId")
                .lean().exec();
            return response;
        }
        const response = yield SubscriptionModel.find({
            $or: [
                {
                    storageSize: { $ne: '' },
                    pgSpace: { $ne: '' }
                }
            ]
        })
            .populate("userId")
            .populate("pricingId")
            .lean().exec();
        return response;
    }
    catch (error) {
        console.error('Error in payAsYouGoService:', error);
        throw error; // Consider re-throwing the error so calling code can handle it
    }
});
exports.payAsYouGoService = payAsYouGoService;
const walletTrackingService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let walletPromise;
        // If id is provided, fetch specific wallet, otherwise fetch all wallets
        if (id) {
            walletPromise = yield wallet_model_1.WalletModel.findById(id).populate("userId", "email business_name prifile_image role business_address business_city business_country business_state").lean().exec(); // Fixed: removed object wrapper
            if (!walletPromise) { // Fixed: check if null/undefined instead of length
                throw new App_1.CustomError({
                    message: 'Wallet not found',
                    code: 404,
                });
            }
            walletPromise = [walletPromise]; // Convert to array for consistent processing
        }
        else {
            walletPromise = yield wallet_model_1.WalletModel.find().populate("userId", "email business_name prifile_image role business_address business_city business_country business_state").lean().exec();
        }
        const userWalletData = [];
        for (const wallet of walletPromise) {
            // Extract the actual userId string from the populated object
            const actualUserId = wallet.userId._id || wallet.userId;
            const transactionsResponse = yield transaction_model_1.TransactionModel.find({
                userId: actualUserId,
            }).lean().exec();
            // Calculate total withdrawals
            const totalWithdrawals = transactionsResponse
                .filter(transaction => transaction.transactionType === 'withdrawal')
                .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
            // Calculate total amount for all transaction types
            const totalAmount = transactionsResponse
                .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
            // Get billing details for the user
            const billingDetails = yield billing_model_1.BillingModel.findOne({
                userId: actualUserId
            }).lean().exec();
            // Store the calculated data
            userWalletData.push({
                userId: actualUserId,
                userDetails: wallet.userId, // Store the populated user object
                walletId: wallet._id,
                wallet: wallet,
                billingDetails: billingDetails,
                totalWithdrawals: totalWithdrawals,
                totalAmount: totalAmount,
                transactionCount: transactionsResponse.length,
                transactions: transactionsResponse
            });
        }
        // If specific wallet requested, return single wallet data
        if (id) {
            return {
                success: true,
                data: userWalletData[0], // Return single wallet data
                walletId: id
            };
        }
        // Return all wallets data with summary
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
    try {
        // Fetch all referral records with populated user data
        const response = yield referalModel.find().populate({
            path: 'referred',
            model: 'User',
            strictPopulate: false
        }).lean().exec();
        // Group data by user and calculate analytics
        const userAnalytics = {};
        let globalStats = {
            totalReferrals: 0,
            totalPointsEarned: 0,
            totalPointsRedeemed: 0,
            totalAmountCredited: 0
        };
        response.forEach((record) => {
            var _a, _b, _c;
            const userId = ((_b = (_a = record.referred) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ((_c = record.referred) === null || _c === void 0 ? void 0 : _c.toString());
            if (!userId)
                return; // Skip if no valid userId
            // Initialize user analytics if not exists
            if (!userAnalytics[userId]) {
                userAnalytics[userId] = {
                    userId: userId,
                    userInfo: record.referred, // Contains populated user data
                    totalReferrals: 0,
                    totalPointsEarned: 0,
                    totalPointsRedeemed: 0,
                    totalAmountCredited: 0,
                    referralRecords: []
                };
            }
            // Calculate referrals count (length of referralsCount array)
            const referralsCount = record.referralsCount ? record.referralsCount.length : 0;
            // Calculate points earned (10 points per referral)
            const pointsEarned = referralsCount * 10;
            // Calculate points redeemed (if reward exists, it means points were redeemed)
            // const pointsRedeemed = record.reward || 0;
            const pointsRedeemed = (pointsEarned > 0 && record.reward) ? record.reward : 0;
            // Amount credited is equivalent to redeemed amount
            const amountCredited = pointsRedeemed;
            // Update user analytics
            userAnalytics[userId].totalReferrals += referralsCount;
            userAnalytics[userId].totalPointsEarned += pointsEarned;
            userAnalytics[userId].totalPointsRedeemed += pointsRedeemed;
            userAnalytics[userId].totalAmountCredited += amountCredited;
            userAnalytics[userId].referralRecords.push({
                recordId: record._id,
                referralCode: record.referralCode,
                status: record.status,
                referralsCount: referralsCount,
                pointsEarned: pointsEarned,
                pointsRedeemed: pointsRedeemed,
                amountCredited: amountCredited,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            });
            // Update global statistics
            globalStats.totalReferrals += referralsCount;
            globalStats.totalPointsEarned += pointsEarned;
            globalStats.totalPointsRedeemed += pointsRedeemed;
            globalStats.totalAmountCredited += amountCredited;
        });
        // Convert userAnalytics object to array for easier handling
        const userAnalyticsArray = Object.values(userAnalytics);
        // Calculate additional metrics for each user
        userAnalyticsArray.forEach((user) => {
            user.availablePoints = user.totalPointsEarned - user.totalPointsRedeemed;
            user.redemptionRate = user.totalPointsEarned > 0
                ? (user.totalPointsRedeemed / user.totalPointsEarned * 100).toFixed(2) + '%'
                : '0%';
        });
        // Sort users by total referrals (descending)
        userAnalyticsArray.sort((a, b) => b.totalReferrals - a.totalReferrals);
        return {
            success: true,
            data: {
                globalStats,
                userAnalytics: userAnalyticsArray,
            }
        };
    }
    catch (error) {
        console.error('Error in referralRecordsAnalyticsService:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
});
exports.referralRecordsAnalyticsService = referralRecordsAnalyticsService;
// export const getUserReferralAnalytics = async (userId:any, userReferralCode = null) => {
//     try {
//         const response = await referalModel.find().populate({
//             path: 'referred',
//             model: 'User',
//             strictPopulate: false
//         }).lean().exec();
//
//         let userStats:any = {
//             userId,
//             totalReferrals: 0,
//             totalPointsEarned: 0,
//             totalPointsRedeemed: 0,
//             totalAmountCredited: 0,
//             availablePoints: 0,
//             referralRecords: [],
//             referrerDetails: null // Will contain who referred this user
//         };
//
//         // Process referral records for analytics
//         response.forEach((record:any) => {
//             const referralsCount = record.referralsCount ? record.referralsCount.length : 0;
//             const pointsEarned = referralsCount * 10;
//             const pointsRedeemed = (pointsEarned > 0 && record.reward) ? record.reward : 0;
//             const amountCredited = pointsRedeemed;
//
//             userStats.totalReferrals += referralsCount;
//             userStats.totalPointsEarned += pointsEarned;
//             userStats.totalPointsRedeemed += pointsRedeemed;
//             userStats.totalAmountCredited += amountCredited;
//
//             userStats.referralRecords.push({
//                 recordId: record._id,
//                 referralCode: record.referralCode,
//                 status: record.status,
//                 referralsCount: referralsCount,
//                 pointsEarned: pointsEarned,
//                 pointsRedeemed: pointsRedeemed,
//                 amountCredited: amountCredited,
//                 createdAt: record.createdAt,
//                 updatedAt: record.updatedAt,
//                 referredUser: record.referred // Populated user details
//             });
//         });
//
//         // If userReferralCode is provided, find who referred this user
//         if (userReferralCode) {
//             const referrerRecord = await referalModel.findOne({
//                 referralCode: userReferralCode
//             }).populate({
//                 path: 'referred',
//                 model: 'User',
//                 strictPopulate: false
//             }).lean().exec();
//
//             if (referrerRecord) {
//                 // Find the referrer's user details
//                 let referrerUserDetails = null, subscriptionPlan:any
//                 if (referrerRecord.referrer) {
//                     // Assuming referrer field contains user ID
//                     referrerUserDetails = await UserModel.findById(referrerRecord.referrer).lean().exec();
//                     subscriptionPlan = await SubscriptionModel.findOne({
//                         userId: referrerUserDetails?._id,
//                     })
//                 }
//
//                 userStats.referrerDetails = {
//                     referralRecord: referrerRecord,
//                     referrerInfo: referrerUserDetails,
//                     subscriptionPlan:subscriptionPlan,
//                     referredUser: referrerRecord.referred // This is the user who was referred (should match current user)
//                 };
//             }
//         }
//
//         // Calculate available points with safeguard against negative values
//         userStats.availablePoints = Math.max(0, userStats.totalPointsEarned - userStats.totalPointsRedeemed);
//
//         userStats.redemptionRate = userStats.totalPointsEarned > 0
//             ? (userStats.totalPointsRedeemed / userStats.totalPointsEarned * 100).toFixed(2) + '%'
//             : '0%';
//         const subscriptionPlan = await SubscriptionModel.findOne({
//             userId: userId
//         }).populate("pricingId").lean().exec();
//         userStats.subscriptionPlan = subscriptionPlan;
//         return {
//             success: true,
//             data: userStats
//         };
//
//     } catch (error:any) {
//         console.error('Error in getUserReferralAnalytics:', error);
//         return {
//             success: false,
//             error: error.message,
//             data: null
//         };
//     }
// };
const assignPlanService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate input
    if (!payload.userId || !payload.planId) {
        throw new App_1.CustomError({
            message: "Missing required fields: userId and planId",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const subscriptionExist = yield SubscriptionModel.findOne({
        userId: payload.userId,
    }).populate("pricingId").lean().exec();
    if (!subscriptionExist) {
        throw new App_1.CustomError({
            message: "No active subscription for user",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (!(subscriptionExist === null || subscriptionExist === void 0 ? void 0 : subscriptionExist.pricingId)) {
        throw new App_1.CustomError({
            message: "Invalid subscription data",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (subscriptionExist.pricingId.plan !== "Free") {
        throw new App_1.CustomError({
            message: "User already has an active plan",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // Get user and pricing details
    const [userDetail, pricingDetails] = yield Promise.all([
        user_model_2.default.findOne({ _id: payload.userId }).lean(),
        PricingModel.findOne({ _id: payload.planId }).lean()
    ]);
    if (!userDetail) {
        throw new App_1.CustomError({
            message: "User not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND
        });
    }
    if (!pricingDetails) {
        throw new App_1.CustomError({
            message: "Pricing plan not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND
        });
    }
    // const duration = 30;
    //
    // const now = new Date();
    // const createdDate = new Date();
    // const expiryDate = new Date(createdDate);
    // expiryDate.setMonth(expiryDate.getMonth() + 1);
    //
    // const currentPeriodEnd = new Date(now);
    // currentPeriodEnd.setDate(now.getDate() + duration);
    const duration = 30;
    const now = new Date();
    const createdDate = new Date();
    const expiryDate = new Date(createdDate);
    expiryDate.setDate(expiryDate.getDate() + duration);
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setDate(now.getDate() + duration);
    const updatedSubscription = yield SubscriptionModel.findOneAndUpdate({
        userId: payload.userId,
    }, {
        pricingId: payload.planId,
        interval: duration,
        isAssignedPlan: true,
        status: "active",
        createdDate: now,
        currentPeriodEnd: expiryDate,
        upgradeWillCancelAt: expiryDate
    }, {
        new: true
    });
    // Send email (don't let email failure break the flow)
    try {
        yield new App_1.EmailService().premiumPlanNotificationMail("Premium Plan Subscription Notification", userDetail === null || userDetail === void 0 ? void 0 : userDetail.email, userDetail === null || userDetail === void 0 ? void 0 : userDetail.business_name, pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.plan, now, currentPeriodEnd);
        console.log("Premium email sent successfully");
    }
    catch (emailError) {
        console.error("Failed to send premium plan email:", emailError);
    }
    return updatedSubscription;
});
exports.assignPlanService = assignPlanService;
// export const getUserReferralAnalytics = async (userId: any, userReferralCode = null) => {
//     try {
//         // Validate userId
//         if (!userId) {
//             return {
//                 success: false,
//                 error: 'User ID is required',
//                 data: null
//             };
//         }
//
//         const response = await referalModel.find().populate({
//             path: 'referred',
//             model: 'User',
//             strictPopulate: false
//         }).lean().exec();
//
//         let userStats: any = {
//             userId,
//             totalReferrals: 0,
//             totalPointsEarned: 0,
//             totalPointsRedeemed: 0,
//             totalAmountCredited: 0,
//             availablePoints: 0,
//             referralRecords: [],
//             referrerDetails: null,
//             subscriptionPlan: null
//         };
//
//         // Process referral records for analytics
//         for (const record of response as any) {
//             const referralsCount = record.referralsCount ? record.referralsCount.length : 0;
//             const pointsEarned = referralsCount * 10;
//             const pointsRedeemed = (pointsEarned > 0 && record.reward) ? record.reward : 0;
//             const amountCredited = pointsRedeemed;
//             let referrerSubscriptionPlan: any = null;
//
//             userStats.totalReferrals += referralsCount;
//             userStats.totalPointsEarned += pointsEarned;
//             userStats.totalPointsRedeemed += pointsRedeemed;
//             userStats.totalAmountCredited += amountCredited;
//
//             // FIX 1: Added await and proper async handling
//             if (record.referred) {
//                 if (record?.referred?.business_name) {
//                     // console.log(record?.referred?.business_name, record.referralCode);
//                     try {
//                         referrerSubscriptionPlan = await SubscriptionModel.findOne({
//                             userId: record?.referred._id,
//                         }).populate("pricingId").lean().exec();
//                     } catch (error) {
//                         console.error('Error fetching referrer subscription plan:', error);
//                         referrerSubscriptionPlan = null;
//                     }
//                 }
//             }
//
//             userStats.referralRecords.push({
//                 recordId: record._id,
//                 referralCode: record.referralCode,
//                 status: record.status,
//                 subscriptionPlan: referrerSubscriptionPlan,
//                 referralsCount: referralsCount,
//                 pointsEarned: pointsEarned,
//                 pointsRedeemed: pointsRedeemed,
//                 amountCredited: amountCredited,
//                 createdAt: record.createdAt,
//                 updatedAt: record.updatedAt,
//                 referredUser: record.referred
//             });
//         }
//
//         // Handle referrer details if userReferralCode is provided
//         if (userReferralCode) {
//             const referrerRecord = await referalModel.findOne({
//                 referralCode: userReferralCode
//             }).populate({
//                 path: 'referred',
//                 model: 'User',
//                 strictPopulate: false
//             }).lean().exec();
//
//             if (referrerRecord) {
//                 let referrerUserDetails = null;
//                 let referrerSubscriptionPlan = null;
//
//                 if (referrerRecord.referrer) {
//                     try {
//                         // Get referrer user details
//                         referrerUserDetails = await UserModel.findById(referrerRecord.referrer).lean().exec();
//
//                         // Get referrer's subscription plan
//                         if (referrerUserDetails) {
//                             referrerSubscriptionPlan = await SubscriptionModel.findOne({
//                                 userId: referrerUserDetails._id,
//                             }).populate("pricingId").lean().exec();
//                         }
//                     } catch (error) {
//                         console.error('Error fetching referrer details:', error);
//                     }
//                 }
//
//                 userStats.referrerDetails = {
//                     referralRecord: referrerRecord,
//                     referrerInfo: referrerUserDetails,
//                     subscriptionPlan: referrerSubscriptionPlan,
//                     referredUser: referrerRecord.referred
//                 };
//             }
//         }
//
//         // Calculate available points
//         userStats.availablePoints = Math.max(0, userStats.totalPointsEarned - userStats.totalPointsRedeemed);
//
//         // Calculate redemption rate
//         userStats.redemptionRate = userStats.totalPointsEarned > 0
//             ? (userStats.totalPointsRedeemed / userStats.totalPointsEarned * 100).toFixed(2) + '%'
//             : '0%';
//
//         // FIX 2: Get current user's subscription plan with proper ObjectId handling
//         try {
//             console.log('Fetching subscription for userId:', userId);
//
//             // FIX 3: Ensure userId is properly formatted for MongoDB
//             const ObjectId = require('mongoose').Types.ObjectId;
//             let searchUserId = userId;
//
//             // Convert to ObjectId if it's a string
//             if (typeof userId === 'string' && ObjectId.isValid(userId)) {
//                 searchUserId = new ObjectId(userId);
//             }
//
//             const subscriptionPlan = await SubscriptionModel.findOne({
//                 userId: searchUserId
//             }).populate("pricingId").lean().exec();
//
//             console.log('Found subscription plan:', subscriptionPlan);
//             userStats.subscriptionPlan = subscriptionPlan;
//
//             // Additional debugging - check if user exists
//             const userExists = await UserModel.findById(searchUserId).lean().exec();
//             console.log('User exists:', !!userExists);
//
//             if (!subscriptionPlan) {
//                 console.log('No subscription found for user:', userId);
//                 // Optional: Check all subscriptions to see what's in the database
//                 const allSubscriptions = await SubscriptionModel.find({}).limit(5).lean().exec();
//                 console.log('Sample subscriptions in DB:', allSubscriptions.map(sub => ({
//                     userId: sub.userId,
//                     userIdType: typeof sub.userId,
//                     id: sub._id
//                 })));
//             }
//
//         } catch (subscriptionError) {
//             console.error('Error fetching user subscription plan:', subscriptionError);
//             userStats.subscriptionPlan = null;
//         }
//
//         return {
//             success: true,
//             data: userStats
//         };
//
//     } catch (error: any) {
//         console.error('Error in getUserReferralAnalytics:', error);
//         return {
//             success: false,
//             error: error.message,
//             data: null
//         };
//     }
// };
const getUserReferralAnalytics = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, userReferralCode = null) {
    var _a;
    try {
        // Validate userId
        if (!userId) {
            return {
                success: false,
                error: 'User ID is required',
                data: null
            };
        }
        // Ensure userId is properly formatted for MongoDB
        const ObjectId = require('mongoose').Types.ObjectId;
        let searchUserId = userId;
        // Convert to ObjectId if it's a string
        if (typeof userId === 'string' && ObjectId.isValid(userId)) {
            searchUserId = new ObjectId(userId);
        }
        // Get referral records where this user was referred by someone (to find who referred them)
        const userReferralRecord = yield referalModel.findOne({
            referred: searchUserId // Find where this user was the one being referred
        }).populate({
            path: 'referred',
            model: 'User',
            strictPopulate: false
        }).lean().exec();
        // Get referral records where this user is the referrer (people they referred)
        const response = yield referalModel.find({
            referrer: userReferralRecord === null || userReferralRecord === void 0 ? void 0 : userReferralRecord.referralCode // Find people this user has referred
        }).populate({
            path: 'referred',
            model: 'User',
            strictPopulate: false
        }).lean().exec();
        let userStats = {
            userId,
            totalReferrals: 0,
            totalPointsEarned: 0,
            totalPointsRedeemed: 0,
            totalAmountCredited: 0,
            availablePoints: 0,
            referralRecords: [],
            referrerDetails: null,
            subscriptionPlan: null
        };
        // Process referral records for analytics
        for (const record of response) {
            const referralsCount = record.referralsCount ? record.referralsCount.length : 0;
            const pointsEarned = referralsCount * 10;
            const pointsRedeemed = (pointsEarned > 0 && record.reward) ? record.reward : 0;
            const amountCredited = pointsRedeemed;
            let referrerSubscriptionPlan = null;
            userStats.totalReferrals += referralsCount;
            userStats.totalPointsEarned += pointsEarned;
            userStats.totalPointsRedeemed += pointsRedeemed;
            userStats.totalAmountCredited += amountCredited;
            // Get subscription plan for referred user
            if (record.referred) {
                if ((_a = record === null || record === void 0 ? void 0 : record.referred) === null || _a === void 0 ? void 0 : _a.business_name) {
                    try {
                        referrerSubscriptionPlan = yield SubscriptionModel.findOne({
                            userId: record === null || record === void 0 ? void 0 : record.referred._id,
                        }).populate("pricingId").lean().exec();
                    }
                    catch (error) {
                        console.error('Error fetching referrer subscription plan:', error);
                        referrerSubscriptionPlan = null;
                    }
                }
            }
            userStats.referralRecords.push({
                recordId: record._id,
                referralCode: record.referralCode,
                status: record.status,
                subscriptionPlan: referrerSubscriptionPlan,
                referralsCount: referralsCount,
                pointsEarned: pointsEarned,
                pointsRedeemed: pointsRedeemed,
                amountCredited: amountCredited,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                referredUser: record.referred
            });
        }
        // Handle referrer details - who referred the current user
        if (userReferralRecord && userReferralRecord.referrer) {
            let referrerUserDetails = null;
            let referrerSubscriptionPlan = null;
            try {
                // Find the referrer's user record by their referral code
                const referrerRecord = yield referalModel.findOne({
                    referralCode: userReferralRecord.referrer
                }).populate({
                    path: 'referred',
                    model: 'User',
                    strictPopulate: false
                }).lean().exec();
                if (referrerRecord && referrerRecord.referred) {
                    referrerUserDetails = referrerRecord.referred;
                    // Get referrer's subscription plan
                    referrerSubscriptionPlan = yield SubscriptionModel.findOne({
                        userId: referrerRecord.referred._id,
                    }).populate("pricingId").lean().exec();
                }
                userStats.referrerDetails = {
                    referralRecord: userReferralRecord,
                    referrerInfo: referrerUserDetails,
                    subscriptionPlan: referrerSubscriptionPlan,
                    referredUser: userReferralRecord.referred
                };
            }
            catch (error) {
                console.error('Error fetching referrer details:', error);
                userStats.referrerDetails = null;
            }
        }
        // Calculate available points
        userStats.availablePoints = Math.max(0, userStats.totalPointsEarned - userStats.totalPointsRedeemed);
        // Calculate redemption rate
        userStats.redemptionRate = userStats.totalPointsEarned > 0
            ? (userStats.totalPointsRedeemed / userStats.totalPointsEarned * 100).toFixed(2) + '%'
            : '0%';
        // Get current user's subscription plan
        try {
            console.log('Fetching subscription for userId:', userId);
            const subscriptionPlan = yield SubscriptionModel.findOne({
                userId: searchUserId
            }).populate("pricingId").lean().exec();
            console.log('Found subscription plan:', subscriptionPlan);
            userStats.subscriptionPlan = subscriptionPlan;
            // Additional debugging - check if user exists
            const userExists = yield user_model_2.default.findById(searchUserId).lean().exec();
            console.log('User exists:', !!userExists);
            if (!subscriptionPlan) {
                console.log('No subscription found for user:', userId);
            }
        }
        catch (subscriptionError) {
            console.error('Error fetching user subscription plan:', subscriptionError);
            userStats.subscriptionPlan = null;
        }
        return {
            success: true,
            data: userStats
        };
    }
    catch (error) {
        console.error('Error in getUserReferralAnalytics:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
});
exports.getUserReferralAnalytics = getUserReferralAnalytics;

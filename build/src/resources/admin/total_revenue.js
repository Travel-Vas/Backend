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
exports.calculateTotalRevenueByUserId = exports.getRedeemedReferralsWithUserDetails = exports.calculateTotalRevenueWithAggregation = exports.calculateTotalRevenue = void 0;
const transaction_model_1 = require("../transactions/transaction.model");
const axios_1 = __importDefault(require("axios"));
const referal_model_1 = require("../referal/referal.model");
const calculateTotalRevenue = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Step 1: Get current NGN to USD exchange rate from a free API
        const exchangeResponse = yield axios_1.default.get('https://api.exchangerate-api.com/v4/latest/NGN');
        const ngnToUsdRate = exchangeResponse.data.rates.USD;
        console.log(`Current NGN to USD rate: ${ngnToUsdRate}`);
        // Step 2: Fetch all completed transactions
        const transactions = yield transaction_model_1.TransactionModel.find({
            txnStatus: "COMPLETED"
        }).lean().exec();
        console.log(`Found ${transactions.length} completed transactions`);
        // Debug: Let's see what transactions look like
        console.log('Sample transactions:', transactions.slice(0, 2));
        // Step 3: Calculate total revenue in USD
        let totalRevenueUSD = 0;
        let usdTotal = 0;
        let ngnTotal = 0;
        let ngnConvertedTotal = 0;
        for (const transaction of transactions) {
            const amount = parseFloat(transaction.amount);
            const currency = (_a = transaction.currency) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            console.log(`Processing transaction: Amount=${transaction.amount}, Currency=${transaction.currency}, Parsed Amount=${amount}`);
            if (currency === 'usd') {
                totalRevenueUSD += amount;
                usdTotal += amount;
                console.log(`USD Transaction: $${amount} (Running total: $${totalRevenueUSD.toFixed(2)})`);
            }
            else if (currency === 'ngn') {
                const convertedAmount = amount * ngnToUsdRate;
                totalRevenueUSD += convertedAmount;
                ngnTotal += amount;
                ngnConvertedTotal += convertedAmount;
                console.log(`NGN Transaction: ₦${amount} = $${convertedAmount.toFixed(2)} (Running total: $${totalRevenueUSD.toFixed(2)})`);
            }
            else {
                console.log(`Unknown currency: ${transaction.currency} for amount: ${transaction.amount}`);
            }
        }
        console.log('=== SUMMARY ===');
        console.log(`Total USD transactions: $${usdTotal.toFixed(2)}`);
        console.log(`Total NGN transactions: ₦${ngnTotal.toFixed(2)} = $${ngnConvertedTotal.toFixed(2)}`);
        console.log(`TOTAL REVENUE: $${totalRevenueUSD.toFixed(2)}`);
        return totalRevenueUSD;
    }
    catch (error) {
        console.error('Error calculating total revenue:', error);
        console.error('Error details:', error.message);
        throw error;
    }
});
exports.calculateTotalRevenue = calculateTotalRevenue;
// Alternative using aggregation pipeline (more efficient for large datasets)
const calculateTotalRevenueWithAggregation = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get exchange rate
        const exchangeResponse = yield axios_1.default.get('https://api.exchangerate-api.com/v4/latest/NGN');
        const ngnToUsdRate = exchangeResponse.data.rates.USD;
        // Use MongoDB aggregation pipeline
        const result = yield transaction_model_1.TransactionModel.aggregate([
            {
                $match: {
                    txnStatus: "COMPLETED"
                }
            },
            {
                $addFields: {
                    amountNumeric: { $toDouble: "$amount" },
                    currencyLower: { $toLower: "$currency" }
                }
            },
            {
                $addFields: {
                    amountInUSD: {
                        $cond: {
                            if: { $eq: ["$currencyLower", "usd"] },
                            then: "$amountNumeric",
                            else: { $multiply: ["$amountNumeric", ngnToUsdRate] }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amountInUSD" },
                    transactionCount: { $sum: 1 },
                    usdTransactions: {
                        $sum: {
                            $cond: [{ $eq: ["$currencyLower", "usd"] }, 1, 0]
                        }
                    },
                    ngnTransactions: {
                        $sum: {
                            $cond: [{ $eq: ["$currencyLower", "ngn"] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        const totalRevenue = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
        const stats = result[0] || {};
        // console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
        // console.log(`Total Transactions: ${stats.transactionCount}`);
        // console.log(`USD Transactions: ${stats.usdTransactions}`);
        // console.log(`NGN Transactions: ${stats.ngnTransactions}`);
        // console.log(`Exchange Rate Used: 1 NGN = $${ngnToUsdRate}`);
        return totalRevenue;
    }
    catch (error) {
        console.error('Error calculating total revenue with aggregation:', error);
        throw error;
    }
});
exports.calculateTotalRevenueWithAggregation = calculateTotalRevenueWithAggregation;
const getRedeemedReferralsWithUserDetails = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Get all redeemed referrals
        const redeemedReferrals = yield referal_model_1.referalModel.find({
            redeemed: true,
        }).lean().exec();
        // Step 2: For each redeemed referral, get the original referral record and populate user details
        const referralsWithUserDetails = [];
        for (const redeemedReferral of redeemedReferrals) {
            // Find the original referral record using the referralCode
            const originalReferral = yield referal_model_1.referalModel.findOne({
                referralCode: redeemedReferral.referralCode
            }).populate([
                { path: 'referred', strictPopulate: false, select: "business_name" },
                { path: 'referrer', strictPopulate: false }
            ]).lean().exec();
            if (originalReferral) {
                referralsWithUserDetails.push({
                    redeemedRecord: redeemedReferral,
                    originalRecord: originalReferral,
                    referrerDetails: originalReferral === null || originalReferral === void 0 ? void 0 : originalReferral.referred,
                });
            }
            else {
                console.log(`No original referral found for code: ${redeemedReferral.referralCode}`);
            }
        }
        return referralsWithUserDetails;
    }
    catch (error) {
        console.error('Error getting redeemed referrals with user details:', error);
        throw error;
    }
});
exports.getRedeemedReferralsWithUserDetails = getRedeemedReferralsWithUserDetails;
const calculateTotalRevenueByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Validate userId input
        if (!userId) {
            throw new Error('User ID is required');
        }
        // Step 1: Get current NGN to USD exchange rate from a free API
        const exchangeResponse = yield axios_1.default.get('https://api.exchangerate-api.com/v4/latest/NGN');
        const ngnToUsdRate = exchangeResponse.data.rates.USD;
        console.log(`Current NGN to USD rate: ${ngnToUsdRate}`);
        // Step 2: Fetch all completed transactions for the specific user
        const transactions = yield transaction_model_1.TransactionModel.find({
            txnStatus: "COMPLETED",
            userId: userId,
            $or: [
                { reason: 'Redeemed referal point' },
                { reason: 'EXTRA_PHOTOs' }
            ]
            // Filter by user ID
        }).lean().exec();
        console.log(`Found ${transactions.length} completed transactions for user ${userId}`);
        // Debug: Let's see what transactions look like
        console.log('Sample transactions:', transactions.slice(0, 2));
        // Step 3: Calculate total revenue in USD for this user
        let totalRevenueUSD = 0;
        let usdTotal = 0;
        let ngnTotal = 0;
        let ngnConvertedTotal = 0;
        for (const transaction of transactions) {
            const amount = parseFloat(transaction.amount);
            const currency = (_a = transaction.currency) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            console.log(`Processing transaction: Amount=${transaction.amount}, Currency=${transaction.currency}, Parsed Amount=${amount}`);
            if (currency === 'usd') {
                totalRevenueUSD += amount;
                usdTotal += amount;
                console.log(`USD Transaction: $${amount} (Running total: $${totalRevenueUSD.toFixed(2)})`);
            }
            else if (currency === 'ngn') {
                const convertedAmount = amount * ngnToUsdRate;
                totalRevenueUSD += convertedAmount;
                ngnTotal += amount;
                ngnConvertedTotal += convertedAmount;
                console.log(`NGN Transaction: ₦${amount} = $${convertedAmount.toFixed(2)} (Running total: $${totalRevenueUSD.toFixed(2)})`);
            }
            else {
                console.log(`Unknown currency: ${transaction.currency} for amount: ${transaction.amount}`);
            }
        }
        console.log('=== SUMMARY ===');
        console.log(`User ID: ${userId}`);
        console.log(`Total USD transactions: $${usdTotal.toFixed(2)}`);
        console.log(`Total NGN transactions: ₦${ngnTotal.toFixed(2)} = $${ngnConvertedTotal.toFixed(2)}`);
        console.log(`TOTAL REVENUE FOR USER: $${totalRevenueUSD.toFixed(2)}`);
        return {
            userId,
            totalRevenueUSD,
            breakdown: {
                usdTotal,
                ngnTotal,
                ngnConvertedTotal
            },
            transactionCount: transactions.length
        };
    }
    catch (error) {
        console.error(`Error calculating total revenue for user ${userId}:`, error);
        console.error('Error details:', error.message);
        throw error;
    }
});
exports.calculateTotalRevenueByUserId = calculateTotalRevenueByUserId;

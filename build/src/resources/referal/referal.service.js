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
exports.redeemRewardService = exports.allReferalsService = exports.getReferalDetailsService = exports.createReferalService = void 0;
const referal_interface_1 = require("./referal.interface");
const referal_code_1 = require("../../utils/referal_code");
const user_model_1 = __importDefault(require("../users/user.model"));
const referal_model_1 = require("./referal.model");
const http_status_codes_1 = require("http-status-codes");
const App_1 = require("../../helpers/lib/App");
const mongoose_1 = __importDefault(require("mongoose"));
const subscription_model_1 = __importDefault(require("../subscription/subscription.model"));
const constants_1 = require("../../helpers/constants");
const cron_1 = require("cron");
const sub_checker_1 = __importDefault(require("../../utils/sub_checker"));
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_interface_1 = require("../transactions/transaction.interface");
const transaction_model_1 = require("../transactions/transaction.model");
const reference_1 = __importDefault(require("../../utils/reference"));
const transaction_status_cron_1 = require("../../utils/transaction_status_cron");
const user_service_1 = require("../users/user.service");
const createReferalService = (T) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const userDetails = yield user_model_1.default.findOne({
            _id: T.referred,
        });
        const code = yield (0, referal_code_1.codeGenerator)(userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name);
        const userExist = yield referal_model_1.referalModel.findOne({
            referred: userDetails === null || userDetails === void 0 ? void 0 : userDetails._id
        });
        if (userExist) {
            return yield user_model_1.default.findOneAndUpdate({
                _id: T.referred,
            }, {
                referralCode: userExist === null || userExist === void 0 ? void 0 : userExist._id
            }).lean();
        }
        if (T.referrer && T.referrer !== "") {
            const referrerExist = yield referal_model_1.referalModel.findOne({
                referralCode: T.referrer,
            }).lean().exec();
            if (!referrerExist) {
                throw new App_1.CustomError({
                    message: "Invalid referrer code",
                    code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
        }
        const referal = yield referal_model_1.referalModel.create({
            referrer: T.referrer,
            referred: T.referred,
            referralCode: code,
            status: referal_interface_1.RFStatus.COMPLETED,
        });
        yield user_model_1.default.findOneAndUpdate({
            _id: T.referred,
        }, {
            referralCode: referal === null || referal === void 0 ? void 0 : referal._id
        }).lean();
        // update referrer count
        const updated = yield referal_model_1.referalModel.findOneAndUpdate({ referralCode: T.referrer }, { $push: { referralsCount: referal === null || referal === void 0 ? void 0 : referal._id } }, { new: true });
        if (!updated) {
            console.log('Failed to update referrals count array');
        }
        else {
            console.log('Successfully updated referrals count array:', updated.referralsCount);
        }
        yield session.commitTransaction();
        session.endSession();
        return referal;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.createReferalService = createReferalService;
const getReferalDetailsService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield referal_model_1.referalModel.findOne({
            _id: id,
        }).populate("referred", "business_name").lean().exec();
        return response;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || "Error fetching referral details",
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.getReferalDetailsService = getReferalDetailsService;
const allReferalsService = (referalCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield referal_model_1.referalModel.find({
            referrer: referalCode
        }).populate("referred", "email role business_name profile_image referralCode").lean().exec();
        return response;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || "Error fetching referral",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.allReferalsService = allReferalsService;
const rewardSystem = (referrer, referred) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        //     validate referred subscription status
        const subscribed = yield subscription_model_1.default.findOne({
            userId: referred,
        }).populate("pricingId").lean().exec();
        if (subscribed &&
            subscribed.pricingId &&
            subscribed.pricingId.plan !== "Free" &&
            subscribed.status === 'active') {
            //     if user is on a paid plan then share the reward to the referrer
            yield referal_model_1.referalModel.findOneAndUpdate({ referralCode: referrer }, {
                $inc: {
                    reward: Number(constants_1.REFERAL_POINT),
                },
                status: referal_interface_1.RFStatus.REWARDED
            }, { new: true });
        }
        yield session.commitTransaction();
        session.endSession();
    }
    catch (error) {
        session.abortTransaction();
        session.endSession();
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
const redeemRewardService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rewards = yield referal_model_1.referalModel.findOne({
            referralCode: payload.referralCode,
        }).lean();
        if (!(rewards === null || rewards === void 0 ? void 0 : rewards.reward)) {
            throw new App_1.CustomError({
                message: "No available reward",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const userWallet = yield wallet_model_1.WalletModel.findOne({
            userId: payload.userId,
        }).lean().exec();
        if (!userWallet) {
            throw new App_1.CustomError({
                message: "No user wallet found",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const userDetails = yield user_model_1.default.findOne({
            _id: payload.userId
        });
        const userReward = rewards === null || rewards === void 0 ? void 0 : rewards.reward;
        // Calculate USD equivalent
        const usdEquivalent = (userReward / 10) * 0.05;
        console.log(`User has ${userReward} points, which equals $${usdEquivalent.toFixed(2)} USD`);
        const payment_payload = {
            userId: payload.userId,
            walletId: userWallet._id,
            email: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email,
            amount: usdEquivalent.toFixed(2).toString(),
            packageType: transaction_interface_1.PackageTypes.CREDIT_WALLET,
            reason: "Redeemed referal point",
            currency: 'USD',
            txnStatus: transaction_interface_1.TxnStatus.PENDING,
            paymentMethods: 'Wallet Transfer',
            txnReference: (0, reference_1.default)(payload.userId)
        };
        const transactionInit = yield transaction_model_1.TransactionModel.create(payment_payload);
        const prev_bal = userWallet.balance + Number(usdEquivalent.toFixed(2));
        yield wallet_model_1.WalletModel.findOneAndUpdate({
            userId: payload.userId,
        }, {
            balance: prev_bal
        }, {
            new: true
        });
        // update reward to zero
        yield referal_model_1.referalModel.findOneAndUpdate({
            referralCode: payload.referralCode,
        }, {
            reward: 0,
            redeemed: true,
            redeemedCount: userReward,
        }, {
            new: true
        }).lean();
        yield transaction_model_1.TransactionModel.findOneAndUpdate({
            _id: transactionInit._id,
        }, {
            txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
        }, { new: true });
        return true;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || "Error redeeming reward",
            code: error.code || "Something went wrong",
        });
    }
});
exports.redeemRewardService = redeemRewardService;
cron_1.CronJob.from({
    cronTime: '0 */2 * * * *', // Run every 30 minutes instead of every 10 seconds
    onTick: function () {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                console.log('Starting referral reward processing:', new Date().toString());
                // Find only COMPLETED referrals that haven't been rewarded yet
                const pendingReferrals = yield referal_model_1.referalModel.find({
                    status: referal_interface_1.RFStatus.COMPLETED
                }).lean();
                let rewardCount = 0;
                for (const referral of pendingReferrals) {
                    // Check if the referred user has a paid subscription
                    const subscribed = yield subscription_model_1.default.findOne({
                        userId: referral.referred,
                        status: "active",
                    }).populate("pricingId").lean().exec();
                    if (subscribed &&
                        subscribed.pricingId &&
                        subscribed.pricingId.plan !== "Free" &&
                        subscribed.status === 'active') {
                        // First mark this specific referral as REWARDED to prevent double-rewarding
                        yield referal_model_1.referalModel.findByIdAndUpdate(referral._id, { status: referal_interface_1.RFStatus.REWARDED }, { new: true, session });
                        // Find the referrer's main referral record by referralCode
                        const referrerRecord = yield referal_model_1.referalModel.findOne({
                            referralCode: referral.referrer
                        });
                        if (referrerRecord) {
                            // Add exactly REFERAL_POINT points to the reward
                            const updatedReward = ((referrerRecord === null || referrerRecord === void 0 ? void 0 : referrerRecord.reward) || 0) + Number(constants_1.REFERAL_POINT);
                            // Calculate correct reward amount
                            // const correctReward = validReferralCount * Number(REFERAL_POINT);
                            console.log(updatedReward);
                            yield referal_model_1.referalModel.findByIdAndUpdate(referrerRecord._id, { reward: updatedReward }, { new: true, session });
                            console.log(`Rewarded referral: ${referral._id}, added ${constants_1.REFERAL_POINT} points to ${referrerRecord.referralCode}`);
                            rewardCount++;
                        }
                        else {
                            console.log(`Warning: Could not find referrer record for code: ${referral.referralCode}`);
                        }
                    }
                    else {
                        yield referal_model_1.referalModel.findByIdAndUpdate(referral._id, { status: referal_interface_1.RFStatus.COMPLETED }, { new: true, session });
                    }
                }
                yield session.commitTransaction();
                session.endSession();
                console.log(`Referral reward processing complete. Processed ${rewardCount} rewards.`);
            }
            catch (error) {
                console.error('Error processing referral rewards:', error);
                yield session.abortTransaction();
                session.endSession();
            }
            yield (0, sub_checker_1.default)();
            yield (0, transaction_status_cron_1.transaction_status_cron)();
            yield (0, user_service_1.brevoCronService)();
        });
    },
    start: true,
});

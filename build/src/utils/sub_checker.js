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
const subscription_model_1 = __importDefault(require("../resources/subscription/subscription.model"));
const user_model_1 = __importDefault(require("../resources/users/user.model"));
const pricing_model_1 = __importDefault(require("../resources/subscription/pricing.model"));
const portfolio_model_1 = __importDefault(require("../resources/portfolio_website/portfolio.model"));
function checkSubscriptionStatuses() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const now = new Date();
            console.log(`Manual subscription status check: ${now.toISOString()}`);
            // Find all expired subscriptions for the specified user
            const expiredSubscriptions = yield subscription_model_1.default.find({
                status: { $in: ['active', 'trialing'] },
                $or: [
                    { currentPeriodEnd: { $lt: now } },
                    { upgradeWillCancelAt: { $lt: now } }
                ]
            }).lean();
            // Find the Free pricing plan
            const pricing = yield pricing_model_1.default.findOne({
                plan: "Free"
            }).lean();
            if (!pricing) {
                return {
                    success: false,
                    message: "Free plan pricing not found"
                };
            }
            let updatedCount = 0;
            // Update each expired subscription
            for (const subscription of expiredSubscriptions) {
                // Update subscription status and change to Free plan
                yield subscription_model_1.default.findByIdAndUpdate(subscription._id, {
                    $set: {
                        pricingId: pricing._id,
                        status: 'active',
                        interval: 'monthly',
                        prev_subscriptionStatus: 'expired',
                    },
                    $unset: {
                        upgradePeriodEnds: "",
                        storageSize: "",
                    },
                });
                // set portfolio to default
                yield portfolio_model_1.default.findOneAndUpdate({
                    userId: subscription.userId
                }, {
                    $unset: {
                        template: ""
                    }
                });
                const subscriptiondetails = yield subscription_model_1.default.findOne({
                    _id: subscription === null || subscription === void 0 ? void 0 : subscription._id
                }).populate("pricingId").lean().exec();
                const dashboardUrl = "https://www.fotolocker.io/sign-in";
                const userDetails = yield user_model_1.default.findOne({
                    _id: subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.userId,
                }).lean().exec();
                const mail_amount = (subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.interval) === "monthly" ? (_a = subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.pricingId) === null || _a === void 0 ? void 0 : _a.amount : (_b = subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.pricingId) === null || _b === void 0 ? void 0 : _b.yearly_amount;
                // await new EmailService().subscriptionExpiredNotificationMail(
                //     "Subscription notification",
                //     userDetails?.email as any,
                //     userDetails?.business_name,
                //     subscriptiondetails?.pricingId?.plan,
                //     subscriptiondetails?.nextBillingDate,
                //     mail_amount,
                //     subscriptiondetails?.interval,
                //     subscriptiondetails?.startDate,
                //     subscriptiondetails?.pricingId.features,
                //     dashboardUrl
                // );
                if (subscription.storageSize && subscription.pricingId === pricing._id) {
                    yield subscription_model_1.default.findByIdAndUpdate(subscription._id, {
                        $set: {
                            pricingId: pricing._id,
                            status: 'active',
                            interval: 'monthly',
                            prev_subscriptionStatus: 'expired',
                        },
                        $unset: {
                            upgradePeriodEnds: "",
                            storageSize: "",
                        },
                    });
                }
                // Update user status to expired and account type to free
                yield user_model_1.default.findByIdAndUpdate(subscription.userId, {
                    subscriptionStatus: 'expired',
                    accountType: 'free'
                });
                updatedCount++;
            }
            console.log(`Manual check complete. Updated ${updatedCount} subscriptions.`);
            return {
                success: true,
                updatedCount,
                message: `Updated ${updatedCount} subscriptions to expired status`
            };
        }
        catch (error) {
            console.error('Error in manual subscription status check:', error);
            return {
                success: false,
                error: error.message
            };
        }
    });
}
exports.default = checkSubscriptionStatuses;

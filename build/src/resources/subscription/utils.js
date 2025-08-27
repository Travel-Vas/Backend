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
exports.cancelPaystackSubscription = exports.cancelStripeSubscription = void 0;
const stripe_1 = __importDefault(require("../../utils/stripe"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const paystack_1 = require("../../utils/paystack");
const subscription_model_1 = __importDefault(require("./subscription.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const portfolio_model_1 = __importDefault(require("../portfolio_website/portfolio.model"));
const cancelStripeSubscription = (_a) => __awaiter(void 0, [_a], void 0, function* ({ subscriptionRecord, subscriptionId, freePlan, immediately, cancelAtPeriodEnd, cancelReason }) {
    if (!(subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.stripeSubscriptionId))
        return null;
    try {
        const subscription = yield stripe_1.default.subscriptions.retrieve(subscriptionRecord.stripeSubscriptionId);
        if (!subscription || subscription.status === 'canceled') {
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: 'active',
                cancelledAt: new Date(),
                cancelReason,
                prev_subscriptionStatus: "canceled",
                cancelAtPeriodEnd: false,
                pricingId: freePlan._id,
                $set: {
                    stripeSubscriptionId: ""
                }
            });
            throw new App_1.CustomError({
                message: `Subscription already cancelled or does not exist: ${subscriptionRecord.stripeSubscriptionId}`,
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
    }
    catch (err) {
        if ((err === null || err === void 0 ? void 0 : err.code) === 'resource_missing') {
            throw new App_1.CustomError({
                message: `Subscription not found in Stripe: ${subscriptionRecord.stripeSubscriptionId}`,
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        throw err; // rethrow for other unexpected errors
    }
    try {
        const stripeSubId = subscriptionRecord.stripeSubscriptionId;
        const userId = subscriptionRecord.userId;
        if (immediately) {
            // Cancel immediately
            yield stripe_1.default.subscriptions.cancel(stripeSubId, {
                invoice_now: false,
                prorate: true
            });
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: 'active',
                cancelledAt: new Date(),
                cancelReason,
                prev_subscriptionStatus: "canceled",
                cancelAtPeriodEnd: false,
                pricingId: freePlan._id,
                $set: {
                    stripeSubscriptionId: ""
                }
            });
            yield user_model_1.default.findByIdAndUpdate(userId, {
                subscriptionStatus: 'cancelled',
                accountType: 'free'
            });
        }
        else {
            // Cancel at period end
            yield stripe_1.default.subscriptions.update(stripeSubId, {
                cancel_at_period_end: cancelAtPeriodEnd,
                metadata: {
                    cancel_reason: cancelReason
                }
            });
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: cancelAtPeriodEnd ? 'active' : 'cancelled',
                cancelAtPeriodEnd,
                cancelReason,
                cancelledAt: cancelAtPeriodEnd ? null : new Date(),
                $set: {
                    stripeSubscriptionId: ""
                }
            });
            if (!cancelAtPeriodEnd) {
                yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                    status: 'active',
                    prev_subscriptionStatus: "canceled",
                    cancelledAt: new Date(),
                    pricingId: freePlan._id,
                    $set: {
                        stripeSubscriptionId: ""
                    }
                });
                yield user_model_1.default.findByIdAndUpdate(userId, {
                    subscriptionStatus: 'cancelled',
                    accountType: 'free'
                });
            }
        }
        // Ensure template is unset (safe to call multiple times)
        yield portfolio_model_1.default.updateMany({ userId }, {
            $unset: { template: "" }
        });
        return {
            message: immediately
                ? "Subscription cancelled immediately and reverted to Free plan"
                : cancelAtPeriodEnd
                    ? "Subscription will be cancelled at the end of the billing period"
                    : "Subscription cancelled successfully and reverted to Free plan",
            subscriptionId
        };
    }
    catch (stripeError) {
        console.error("Stripe cancellation error:", stripeError);
        throw new App_1.CustomError({
            message: `Failed to cancel subscription in payment provider: ${stripeError.message}`,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
});
exports.cancelStripeSubscription = cancelStripeSubscription;
const cancelPaystackSubscription = (_a) => __awaiter(void 0, [_a], void 0, function* ({ subscriptionRecord, subscriptionId, freePlan, immediately, cancelAtPeriodEnd, cancelReason }) {
    if (!subscriptionRecord.paystackSubscriptionCode)
        return;
    try {
        // Disable the Paystack subscription
        yield paystack_1.paystack.subscription.disable(subscriptionRecord.paystackSubscriptionCode);
        if (immediately) {
            // Cancel immediately and revert to Free plan
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: 'active',
                prev_subscriptionStatus: 'cancelled',
                cancelledAt: new Date(),
                cancelReason,
                cancelAtPeriodEnd: false,
                pricingId: freePlan._id,
                storageSize: '',
                currentPeriodEnd: ''
            });
            yield user_model_1.default.findByIdAndUpdate(subscriptionRecord.userId, {
                subscriptionStatus: 'cancelled',
                accountType: 'free'
            });
        }
        else {
            // Cancel at period end or immediately if specified otherwise
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: cancelAtPeriodEnd ? 'active' : 'cancelled',
                cancelAtPeriodEnd,
                cancelReason,
                cancelledAt: cancelAtPeriodEnd ? null : new Date(),
                storageSize: '',
                currentPeriodEnd: cancelAtPeriodEnd ? subscriptionRecord.currentPeriodEnd : ''
            });
            if (!cancelAtPeriodEnd) {
                yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                    status: 'active',
                    prev_subscriptionStatus: 'cancelled',
                    cancelledAt: new Date(),
                    pricingId: freePlan._id
                });
                yield user_model_1.default.findByIdAndUpdate(subscriptionRecord.userId, {
                    subscriptionStatus: 'cancelled',
                    accountType: 'free'
                });
            }
        }
        // Always clear template (safe redundancy)
        yield portfolio_model_1.default.updateMany({ userId: subscriptionRecord.userId }, { $unset: { template: '' } });
        return {
            message: immediately
                ? 'Subscription cancelled immediately and reverted to Free plan'
                : cancelAtPeriodEnd
                    ? 'Subscription will be cancelled at the end of the billing period'
                    : 'Subscription cancelled successfully and reverted to Free plan',
            subscriptionId
        };
    }
    catch (paystackError) {
        console.error('Paystack cancellation error:', paystackError);
        throw new App_1.CustomError({
            message: `Failed to cancel subscription in payment provider: ${paystackError.message}`,
            code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE
        });
    }
});
exports.cancelPaystackSubscription = cancelPaystackSubscription;

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
exports.paystackSubscriptionService = exports.cancelPaystackSubscriptionService = exports.cancelSubscriptionService = exports.subscriptionService = exports.handleSetupIntentSucceeded = exports.getAllUsersSubscriptionsService = exports.userSubscriptionService = exports.getPricingService = exports.pricingService = void 0;
const pricing_model_1 = __importDefault(require("./pricing.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const transaction_interface_1 = require("../transactions/transaction.interface");
const billing_model_1 = require("../payment/billing.model");
const user_model_1 = __importDefault(require("../users/user.model"));
const transaction_model_1 = require("../transactions/transaction.model");
const stripe_currency_setup_1 = __importDefault(require("../../utils/stripe_currency_setup"));
const subscription_model_1 = __importDefault(require("./subscription.model"));
const stripe_1 = __importDefault(require("../../utils/stripe"));
const paystack_1 = require("../../utils/paystack");
const reference_1 = __importDefault(require("../../utils/reference"));
const portfolio_model_1 = __importDefault(require("../portfolio_website/portfolio.model"));
const utils_1 = require("./utils");
const pricingService = (args) => __awaiter(void 0, void 0, void 0, function* () {
    if (!args.plan) {
        throw new App_1.CustomError({
            message: 'plan is required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (!args.features) {
        throw new App_1.CustomError({
            message: 'Fields are required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield pricing_model_1.default.create(args);
    if (!response) {
        throw new App_1.CustomError({
            message: "Error creating pricing",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    return response;
});
exports.pricingService = pricingService;
const getPricingService = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield pricing_model_1.default.find().lean().exec();
    return response;
});
exports.getPricingService = getPricingService;
const userSubscriptionService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield subscription_model_1.default.findOne({ userId: userId })
        .populate("userId", "business_name email profile")
        .populate("pricingId", "plan amount features")
        .lean()
        .exec();
    return response;
});
exports.userSubscriptionService = userSubscriptionService;
const getAllUsersSubscriptionsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield subscription_model_1.default.find({
        userId: userId,
        status: "active",
        interval: { $in: ["monthly", "yearly", "15", "30"] },
    }).populate("pricingId", "plan amount yearly_amount ngAmount ngYearAmount upgradePeriodEnds upgradeWillCancelAt storageSize features").lean().exec();
    return response;
});
exports.getAllUsersSubscriptionsService = getAllUsersSubscriptionsService;
// const mapStripeStatusToTxnStatus = (stripeStatus: string): TxnStatus => {
//     switch (stripeStatus) {
//         case 'active':
//         case 'trialing':
//             return TxnStatus.COMPLETED;
//         case 'incomplete':
//         case 'past_due':
//             return TxnStatus.PENDING;
//         case 'canceled':
//         case 'unpaid':
//             return TxnStatus.FAILED;
//         default:
//             return TxnStatus.PENDING;
//     }
// };
// export const subscriptionService = async <T extends SubscriptionInterface>(args: T) => {
//     try {
//         // No session or transaction
//         const pricingDetails = await PricingModel.findOne({
//             _id: args.pricingId
//         }).lean().exec();
//
//         if (!pricingDetails) {
//             throw new CustomError({
//                 message: "Invalid pricing details",
//                 code: StatusCodes.BAD_REQUEST
//             });
//         }
//
//         const userDetails = await UserModel.findOne({
//             _id: args.userId,
//         });
//
//         if (!userDetails) {
//             throw new CustomError({
//                 message: "User not found",
//                 code: StatusCodes.NOT_FOUND
//             });
//         }
//
//         // Fixed transaction check to include userId
//         const transactExist = await TransactionModel.findOne({
//             userId: args.userId,
//             pricingId: args.pricingId,
//             txnStatus: { $in: [TxnStatus.PENDING, TxnStatus.COMPLETED] }
//         });
//
//         if (transactExist) {
//             throw new CustomError({
//                 message: 'Duplicate transaction detected',
//                 code: StatusCodes.CONFLICT,
//             });
//         }
//
//         const existingSubscription = await SubscriptionModel.findOne({
//             userId: args.userId,
//             pricingId: args.pricingId,
//             status: { $in: ['active', 'pending'] }
//         });
//
//         if (existingSubscription) {
//             throw new CustomError({
//                 message: 'User already has an active subscription to this plan',
//                 code: StatusCodes.CONFLICT,
//             });
//         }
//
//         const billingDetails = await BillingModel.findOne({
//             user_id: args.userId,
//         });
//
//         const currency = userDetails?.currency || args.currency || 'ngn';
//         const country = billingDetails?.country || 'ng';
//
//         // Convert amount to proper type
//         const amount = typeof pricingDetails.amount === 'string'
//             ? parseFloat(pricingDetails.amount)
//             : pricingDetails.amount;
//
//         const payment_payload: ITransaction = {
//             userId: args.userId,
//             pricingId: args.pricingId,
//             email: userDetails.email,
//             amount: amount.toString(),
//             packageType: pricingDetails?.plan as any,
//             reason: "subscription",
//             currency: currency,
//             txnStatus: TxnStatus.PENDING,
//             paymentMethods: args.paymentMethod,
//         };
//
//         // Create documents without transaction session
//         const paymentInit = await TransactionModel.create(payment_payload);
//         const subscriptionRecord = await SubscriptionModel.create({
//             ...args,
//             status: 'pending'
//         });
//
//         const availablePaymentMethods = getAvailablePaymentMethods(
//             Number(payment_payload.amount),
//             currency,
//             country
//         );
//
//         // Fixed handling of payment method types
//         const payment_method_types = args.paymentMethod
//             ? (Array.isArray(args.paymentMethod)
//                 ? args.paymentMethod.filter((method:any) => availablePaymentMethods.includes(method))
//                 : [args.paymentMethod].filter((method:any) => availablePaymentMethods.includes(method)))
//             : availablePaymentMethods;
//
//         let customerId = userDetails.stripeCustomerId;
//
//         try {
//             if (!customerId) {
//                 const customer = await stripe.customers.create({
//                     email: userDetails.email,
//                     name: userDetails.business_name || userDetails.email,
//                     metadata: { userId: args.userId.toString() }
//                 });
//
//                 customerId = customer.id;
//
//                 await UserModel.findByIdAndUpdate(
//                     userDetails._id,
//                     { stripeCustomerId: customerId }
//                 );
//             }
//
//             const priceId = await getOrCreateStripePriceId(pricingDetails);
//             if (!priceId) {
//                 throw new CustomError({
//                     message: "Failed to create or retrieve subscription price",
//                     code: StatusCodes.INTERNAL_SERVER_ERROR,
//                 });
//             }
//
//             const setupIntent = await stripe.setupIntents.create({
//                 customer: customerId,
//                 payment_method_types:payment_method_types.length > 0 ? payment_method_types : ['cards'],
//                 metadata: {
//                     transactionId: paymentInit?._id.toString(),
//                     userId: args?.userId?.toString(),
//                     pricingId: args?.pricingId?.toString(),
//                     subscriptionId: subscriptionRecord?._id.toString()
//                 }
//             });
//
//                 await TransactionModel.findByIdAndUpdate(
//                     paymentInit._id,
//                     {
//                         stripeSetupIntentId: setupIntent.id,
//                         pendingSubscriptionData: {
//                             customerId,
//                             priceId,
//                             currency,
//                             trial_period_days: undefined
//                         },
//                         txnStatus: TxnStatus.PROCESSING
//                     }
//                 );
//
//             await SubscriptionModel.findByIdAndUpdate(
//                 subscriptionRecord._id,
//                 {
//                     stripeSetupIntentId: setupIntent.id
//                 }
//             );
//
//             return {
//                 setupIntent: {
//                     id: setupIntent.id,
//                     clientSecret: setupIntent.client_secret
//                 },
//                 transactionId: paymentInit._id,
//                 subscriptionId: subscriptionRecord._id,
//                 availablePaymentMethods: payment_method_types
//             };
//         } catch (stripeError: any) {
//             // Handle Stripe-specific errors
//             console.error("Stripe API error:", stripeError);
//
//             // Clean up created records if Stripe operation fails
//             await TransactionModel.findByIdAndDelete(paymentInit._id);
//             await SubscriptionModel.findByIdAndDelete(subscriptionRecord._id);
//
//             throw new CustomError({
//                 message: `Payment processing failed: ${stripeError.message || "Unknown error"}`,
//                 code: StatusCodes.SERVICE_UNAVAILABLE,
//             });
//         }
//     } catch (error: any) {
//         console.error("Subscription service error:", error);
//         if (error instanceof CustomError) throw error;
//
//         throw new CustomError({
//             message: error.message || "Failed to process subscription",
//             code: StatusCodes.INTERNAL_SERVER_ERROR,
//         });
//     }
// };
const getOrCreateStripePriceId = (pricingDetails_1, ...args_1) => __awaiter(void 0, [pricingDetails_1, ...args_1], void 0, function* (pricingDetails, interval = 'monthly') {
    var _a;
    // Check for existing price ID based on interval
    const priceIdField = interval === 'yearly' ? 'stripeYearlyPriceId' : 'stripePriceId';
    if (pricingDetails[priceIdField]) {
        return pricingDetails[priceIdField];
    }
    // Create a product if needed
    let productId = pricingDetails.stripeProductId;
    if (!productId) {
        let featuresMetadata;
        try {
            if (typeof (pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.features) === 'string') {
                featuresMetadata = pricingDetails.features;
            }
            else if (typeof (pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.features) === 'object' && (pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.features) !== null) {
                featuresMetadata = JSON.stringify(pricingDetails.features);
            }
            else {
                featuresMetadata = `${pricingDetails.plan} features`;
            }
        }
        catch (error) {
            console.error("Error processing features for Stripe metadata:", error);
            featuresMetadata = `${pricingDetails.plan} subscription features`;
        }
        const product = yield stripe_1.default.products.create({
            name: pricingDetails.name || `${pricingDetails.plan} Plan`,
            description: typeof pricingDetails.features === 'string'
                ? pricingDetails.features
                : `${pricingDetails.plan} subscription plan`,
            metadata: {
                pricingId: pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails._id.toString(),
                features: featuresMetadata,
            }
        });
        productId = product.id;
        // Update the pricing model with product ID
        yield pricing_model_1.default.findByIdAndUpdate(pricingDetails._id, { stripeProductId: productId });
    }
    // Get the correct amount based on interval
    const amount = interval === 'yearly' ? pricingDetails.yearly_amount : pricingDetails.amount;
    // Create the price
    const price = yield stripe_1.default.prices.create({
        product: productId,
        unit_amount: Math.round(amount * 100),
        currency: ((_a = pricingDetails.currency) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'usd',
        recurring: {
            interval: interval === 'yearly' ? 'year' : 'month'
        },
        metadata: {
            pricingId: pricingDetails._id.toString(),
            interval: interval
        }
    });
    // Update pricing details with the appropriate price ID
    const updateData = {
        [priceIdField]: price.id
    };
    yield pricing_model_1.default.findByIdAndUpdate(pricingDetails._id, updateData);
    return price.id;
});
// Create webhook handler to complete subscription after payment method is attached
const handleSetupIntentSucceeded = (setupIntent, pricingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    try {
        const interval = ((_d = (_c = (_b = (_a = setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.lines) === null || _a === void 0 ? void 0 : _a.object) === null || _b === void 0 ? void 0 : _b.data[0].price) === null || _c === void 0 ? void 0 : _c.recurring) === null || _d === void 0 ? void 0 : _d.interval) || ((_e = setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.metadata) === null || _e === void 0 ? void 0 : _e.interval);
        console.log(setupIntent.id);
        const subscriptionId = (setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.id) || ((_h = (_g = (_f = setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.lines) === null || _f === void 0 ? void 0 : _f.object) === null || _g === void 0 ? void 0 : _g.data[0]) === null || _h === void 0 ? void 0 : _h.subscription);
        const transaction = yield transaction_model_1.TransactionModel.findOne({ stripeSubscriptionId: subscriptionId })
            .lean()
            .exec();
        if (!transaction) {
            console.error('No transaction found with setupIntentId:', setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.id);
            throw new Error('Transaction not found for setup intent');
        }
        // console.log('Found transaction:', JSON.stringify(transaction, null, 2));
        // Check if pendingSubscriptionData exists and has the expected structure
        if (!transaction.pendingSubscriptionData ||
            !transaction.pendingSubscriptionData.customerId ||
            !transaction.pendingSubscriptionData.priceId) {
            console.error('Transaction missing required subscription data:', transaction);
            throw new Error('Missing subscription data');
        }
        const { customerId, priceId, currency, trial_period_days } = transaction === null || transaction === void 0 ? void 0 : transaction.pendingSubscriptionData;
        // let trialDays = parseInt(trial_period_days, 10);
        // // Now create the subscription with the payment method that was just set up
        // const subscription: any = await stripe.subscriptions.create({
        //     customer: customerId,
        //     items: [{ price: priceId }],
        //     default_payment_method: setupIntent?.payment_method,
        //     payment_behavior: 'default_incomplete',
        //     payment_settings: {
        //         save_default_payment_method: 'on_subscription',
        //         payment_method_types: ['card']
        //     },
        //     metadata: setupIntent.metadata,
        //     expand: ['latest_invoice.payment_intent'],
        //     trial_period_days: trialDays || 10
        // });
        // const currentStatus = mapStripeStatusToTxnStatus(subscription?.status)
        // Update transaction with subscription info
        let transact;
        if (setupIntent.status === "active" || setupIntent.status === "paid") {
            yield subscription_model_1.default.findOneAndUpdate({ stripeSubscriptionId: setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.id }, {
                status: "active",
                interval: interval === 'monthly' ? 'monthly' : 'yearly',
                pricingId: pricingId,
            });
        }
        if (setupIntent.status === "active" || setupIntent.status === "paid") {
            transact = yield transaction_model_1.TransactionModel.findOneAndUpdate({ stripeSubscriptionId: setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.id }, {
                txnStatus: transaction_interface_1.TxnStatus.COMPLETED
                // stripeSubscriptionId: subscription?.id,
                // stripePaymentIntentId: subscription?.latest_invoice?.payment_intent?.id,
                // txnStatus: currentStatus === "active" ? TxnStatus.COMPLETED : TxnStatus.PROCESSING,
            });
        }
        // Update subscription with subscription info
        // await SubscriptionModel.findOneAndUpdate(
        //     { stripeSetupIntentId: setupIntent?.id },
        //     {
        //         stripeSubscriptionId: subscription?.id,
        //         status: mapStripeStatusToTxnStatus(subscription?.status),
        //         currentPeriodStart: new Date(subscription?.current_period_start * 1000),
        //         // currentPeriodEnd: new Date(subscription?.current_period_end * 1000),
        //         cancelAtPeriodEnd: subscription?.cancel_at_period_end
        //     }
        // );
        const userId = (_j = setupIntent.metadata) === null || _j === void 0 ? void 0 : _j.userId;
        const userDetails = yield user_model_1.default.findOne({
            _id: userId ? userId : transact === null || transact === void 0 ? void 0 : transact.userId,
        });
        const subscriptiondetails = yield subscription_model_1.default.findOne({
            $or: [
                { stripeSetupIntentId: setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.id },
                { _id: (_k = setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.metadata) === null || _k === void 0 ? void 0 : _k.subscriptionId }
            ]
        }).populate("pricingId").lean();
        // send email to client
        const dashboardUrl = "https://staging.fotolocker.io/sign-in";
        const mail_amount = (subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.interval) === "monthly" ? (_l = subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.pricingId) === null || _l === void 0 ? void 0 : _l.amount : (_m = subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.pricingId) === null || _m === void 0 ? void 0 : _m.yearly_amount;
        yield new App_1.EmailService().subscriptionNotificationMail("Subscription notification", userDetails === null || userDetails === void 0 ? void 0 : userDetails.email, userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name, (_o = subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.pricingId) === null || _o === void 0 ? void 0 : _o.plan, mapStripeStatusToTxnStatus("active"), mail_amount, subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.interval, subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.startDate, subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.nextBillingDate, subscriptiondetails === null || subscriptiondetails === void 0 ? void 0 : subscriptiondetails.pricingId.features, dashboardUrl);
        return true;
    }
    catch (error) {
        console.error('Error completing subscription after setup:', error);
        throw error;
    }
});
exports.handleSetupIntentSucceeded = handleSetupIntentSucceeded;
const mapStripeStatusToTxnStatus = (stripeStatus) => {
    switch (stripeStatus) {
        case 'active':
        case 'succeeded':
        case 'trialing':
            return 'active';
        case 'incomplete':
            return 'canceled';
        case 'past_due':
            return 'pending';
        case 'canceled':
        case 'unpaid':
            return 'failed';
        default:
            return 'pending';
    }
};
const subscriptionService = (args, ip) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const txnReference = (0, reference_1.default)(args.userId);
        const pricingDetails = yield pricing_model_1.default.findOne({
            _id: args.pricingId
        }).lean().exec();
        if (!pricingDetails) {
            throw new App_1.CustomError({
                message: "Invalid pricing details",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const userDetails = yield user_model_1.default.findOne({
            _id: args.userId,
        });
        if (!userDetails) {
            throw new App_1.CustomError({
                message: "User not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const now = new Date();
        const recentTimeframe = new Date(now);
        recentTimeframe.setMinutes(recentTimeframe.getMinutes() - 24); // this should be 24 hours not 5 minutes
        const transactExist = yield transaction_model_1.TransactionModel.findOne({
            userId: args.userId,
            pricingId: args.pricingId,
            createdAt: { $gte: recentTimeframe }
        });
        if ((transactExist === null || transactExist === void 0 ? void 0 : transactExist.txnStatus) === transaction_interface_1.TxnStatus.PENDING) {
            yield transaction_model_1.TransactionModel.findByIdAndDelete({
                _id: transactExist._id,
            });
        }
        // if transaction is pending delete that record and create a new record
        if ((transactExist === null || transactExist === void 0 ? void 0 : transactExist.txnReference) === txnReference) {
            throw new App_1.CustomError({
                message: 'Duplicate transaction detected',
                code: http_status_codes_1.StatusCodes.CONFLICT,
            });
        }
        // Check for existing subscription
        const existingSubscription = yield subscription_model_1.default.findOne({
            userId: args.userId,
            status: { $in: ['active', 'pending', 'expired', 'canceled'] }
        });
        // Handle existing subscription - update instead of throwing error
        let subscriptionRecord;
        if (existingSubscription) {
            if (existingSubscription.pricingId.toString() !== args.pricingId.toString()) {
                const existingPlanDetails = yield pricing_model_1.default.findOne({
                    _id: existingSubscription.pricingId
                }).lean().exec();
                const isUpgradeFromFreePlan = (existingPlanDetails === null || existingPlanDetails === void 0 ? void 0 : existingPlanDetails.plan) === 'Free';
                if (isUpgradeFromFreePlan || true) {
                    const createdDate = new Date();
                    const expiryDate = new Date(createdDate);
                    if (args.interval === 'yearly') {
                        // expiryDate.setMinutes(expiryDate.getMinutes() + 2)
                        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    }
                    else {
                        expiryDate.setMonth(expiryDate.getMonth() + 1);
                        // expiryDate.setMinutes(expiryDate.getMinutes() + 2); // this should be 1 month not 5 minutes
                    }
                    console.log("expiry data", expiryDate);
                    // Update the existing subscription with new pricing ID and set status to pending
                    subscriptionRecord = yield subscription_model_1.default.findByIdAndUpdate(existingSubscription._id, {
                        // status: 'pending',
                        startDate: createdDate,
                        currentPeriodEnd: expiryDate,
                        nextBillingDate: expiryDate,
                        upgradeWillCancelAt: expiryDate
                        // interval:args.interval,
                    }, { new: true });
                    // If previous subscription was active but not free, we might need
                    // to cancel the previous subscription in Stripe
                    if (existingSubscription.status === 'active' &&
                        !isUpgradeFromFreePlan &&
                        existingSubscription.stripeSubscriptionId) {
                        try {
                            // Cancel at period end to avoid immediate cancellation
                            yield stripe_1.default.subscriptions.update(existingSubscription.stripeSubscriptionId, {
                                cancel_at_period_end: true,
                            });
                        }
                        catch (cancelError) {
                            console.error("Error cancelling previous subscription:", cancelError);
                            // Continue with the process even if cancellation fails
                        }
                    }
                }
                else {
                    throw new App_1.CustomError({
                        message: 'User already has an active subscription. Use forceUpdate flag to change plans.',
                        code: http_status_codes_1.StatusCodes.CONFLICT,
                    });
                }
            }
            else {
                throw new App_1.CustomError({
                    message: 'User already has an active subscription to this plan',
                    code: http_status_codes_1.StatusCodes.CONFLICT,
                });
            }
        }
        else {
            // Create a new subscription record if no existing subscription
            const createdDate = new Date();
            const expiryDate = new Date(createdDate);
            if (args.interval === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }
            else {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            }
            subscriptionRecord = yield subscription_model_1.default.create(Object.assign(Object.assign({}, args), { status: 'active', startDate: createdDate, currentPeriodEnd: expiryDate, nextBillingDate: expiryDate, upgradeWillCancelAt: expiryDate, interval: args.interval }));
        }
        const billingDetails = yield billing_model_1.BillingModel.findOne({
            user_id: args.userId,
        });
        const currency = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.currency) || args.currency || 'usd';
        const country = (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country) || 'usd';
        // Convert amount to proper type
        const intervalAmount = args.interval === "monthly" ? pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.amount : pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.yearly_amount;
        // Convert amount to proper type
        const amount = Number(intervalAmount);
        const payment_payload = {
            userId: args.userId,
            pricingId: args.pricingId,
            email: userDetails.email,
            amount: amount.toString(),
            packageType: pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.plan,
            reason: "subscription",
            currency: currency,
            provider: "stripe",
            txnStatus: transaction_interface_1.TxnStatus.PENDING,
            paymentMethods: args.paymentMethod,
        };
        // Create transaction document
        const paymentInit = yield transaction_model_1.TransactionModel.create(payment_payload);
        const availablePaymentMethods = (0, stripe_currency_setup_1.default)(Number(payment_payload.amount), currency, country);
        // Fixed handling of payment method types
        const payment_method_types = args.paymentMethod
            ? (Array.isArray(args.paymentMethod)
                ? args.paymentMethod.filter((method) => availablePaymentMethods.includes(method))
                : [args.paymentMethod].filter((method) => availablePaymentMethods.includes(method)))
            : availablePaymentMethods;
        let customerId = userDetails.stripeCustomerId;
        const amountInCents = Math.round(amount * 100);
        try {
            if (!customerId) {
                const customer = yield stripe_1.default.customers.create({
                    email: userDetails.email,
                    name: userDetails.business_name || userDetails.email,
                    metadata: { userId: args.userId.toString() }
                });
                customerId = customer.id;
                yield user_model_1.default.findByIdAndUpdate(userDetails._id, { stripeCustomerId: customerId });
            }
            const priceId = yield getOrCreateStripePriceId(pricingDetails, args.interval);
            if (!priceId) {
                throw new App_1.CustomError({
                    message: "Failed to create or retrieve subscription price",
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                });
            }
            // const setupIntent = await stripe.setupIntents.create({
            //     customer: customerId,
            //     payment_method_types: payment_method_types.length > 0 ? payment_method_types : ['card'],
            //     metadata: {
            //         transactionId: paymentInit?._id.toString(),
            //         userId: args?.userId?.toString(),
            //         pricingId: args?.pricingId?.toString(),
            //         interval: args.interval?.toString(),
            //         subscriptionId: subscriptionRecord?._id.toString(),
            //     }
            // });
            const subscription = yield stripe_1.default.subscriptions.create({
                customer: customerId,
                items: [{
                        price: priceId,
                    }],
                payment_behavior: 'default_incomplete',
                payment_settings: {
                    save_default_payment_method: 'on_subscription',
                    payment_method_types: ['card']
                },
                expand: ['latest_invoice.payment_intent'],
                collection_method: 'charge_automatically',
                metadata: {
                    transactionId: paymentInit === null || paymentInit === void 0 ? void 0 : paymentInit._id.toString(),
                    userId: (_a = args === null || args === void 0 ? void 0 : args.userId) === null || _a === void 0 ? void 0 : _a.toString(),
                    pricingId: (_b = args === null || args === void 0 ? void 0 : args.pricingId) === null || _b === void 0 ? void 0 : _b.toString(),
                    subscriptionId: subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord._id.toString(),
                }
            });
            const paymentIntent = (_c = subscription === null || subscription === void 0 ? void 0 : subscription.latest_invoice) === null || _c === void 0 ? void 0 : _c.payment_intent;
            yield transaction_model_1.TransactionModel.findByIdAndUpdate(paymentInit._id, {
                txnReference: txnReference,
                stripeSubscriptionId: subscription === null || subscription === void 0 ? void 0 : subscription.id,
                stripePaymentIntentId: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.id,
                pendingSubscriptionData: {
                    customerId,
                    priceId,
                    currency,
                    trial_period_days: 10,
                    interval: args.interval || 'monthly'
                },
                txnStatus: transaction_interface_1.TxnStatus.PROCESSING
            });
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionRecord._id, {
                status: "active",
                payment_provider: "stripe",
                interval: args.interval,
                stripeSubscriptionId: subscription === null || subscription === void 0 ? void 0 : subscription.id,
                startDate: new Date(subscription.current_period_start * 1000), // Convert Unix timestamp to Date
                currentPeriodEnd: new Date(subscription.current_period_end * 1000), // Convert Unix timestamp to Date
                nextBillingDate: new Date(subscription.current_period_end * 1000),
            });
            return {
                setupIntent: {
                    id: subscription.id,
                    clientSecret: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.client_secret
                },
                transactionId: paymentInit._id,
                subscriptionId: subscriptionRecord._id,
                availablePaymentMethods: payment_method_types
            };
        }
        catch (stripeError) {
            console.error("Stripe API error:", stripeError);
            yield transaction_model_1.TransactionModel.findByIdAndDelete(paymentInit._id);
            if (!existingSubscription) {
                yield subscription_model_1.default.findByIdAndDelete(subscriptionRecord._id);
            }
            else if (existingSubscription.pricingId.toString() !== args.pricingId.toString()) {
                // Revert subscription changes if updating an existing one
                yield subscription_model_1.default.findByIdAndUpdate(subscriptionRecord._id, {
                    pricingId: existingSubscription.pricingId,
                    status: existingSubscription.status
                });
            }
            throw new App_1.CustomError({
                message: `Payment processing failed: ${stripeError.message || "Unknown error"}`,
                code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE,
            });
        }
    }
    catch (error) {
        console.error("Subscription service error:", error);
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || "Failed to process subscription",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.subscriptionService = subscriptionService;
const cancelSubscriptionService = (subscriptionId_1, ...args_1) => __awaiter(void 0, [subscriptionId_1, ...args_1], void 0, function* (subscriptionId, options = {}) {
    var _a, _b, _c;
    try {
        // Set default options
        const { cancelAtPeriodEnd = false, cancelReason = 'user_requested', immediately = true } = options;
        if (!subscriptionId) {
            throw new App_1.CustomError({
                message: `Subscription id is missing`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const subscriptionRecord = yield subscription_model_1.default.findById(subscriptionId).populate("pricingId");
        if (!subscriptionRecord) {
            throw new App_1.CustomError({
                message: "Subscription not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        // Check if subscription is already cancelled
        if (subscriptionRecord.status === 'cancelled') {
            throw new App_1.CustomError({
                message: "Subscription is already cancelled",
                code: http_status_codes_1.StatusCodes.CONFLICT
            });
        }
        // Find the Free pricing plan for reverting users after cancellation
        const freePlan = yield pricing_model_1.default.findOne({ plan: "Free" });
        if (!freePlan) {
            throw new App_1.CustomError({
                message: "Free plan pricing not found",
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
        // Check if we have a Stripe subscription ID
        if (!subscriptionRecord.stripeSubscriptionId || !subscriptionRecord.paystackSubscriptionCode) {
            // If there's no Stripe subscription (e.g., free plan), just update our records
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: 'active',
                prev_subscriptionStatus: "canceled",
                cancelledAt: new Date(),
                cancelReason,
                pricingId: freePlan._id, // Set to Free plan
                // currentPeriodEnd:""
            });
            // Update user to free account type
            yield user_model_1.default.findByIdAndUpdate(subscriptionRecord.userId, {
                subscriptionStatus: 'cancelled',
                accountType: 'free'
            });
            yield portfolio_model_1.default.findOneAndUpdate({
                userId: subscriptionRecord.userId
            }, {
                $set: {
                    template: ""
                }
            });
            return {
                message: "Subscription cancelled successfully",
                subscriptionId: subscriptionId
            };
        }
        // Handle Stripe subscription cancellation
        if (subscriptionRecord.stripeSubscriptionId) {
            const payload = {
                subscriptionRecord: subscriptionRecord,
                subscriptionId: subscriptionRecord.stripeSubscriptionId,
                freePlan: freePlan,
                immediately: true,
                cancelAtPeriodEnd: false,
                cancelReason: cancelReason
            };
            yield (0, utils_1.cancelStripeSubscription)(payload);
            // try {
            //     if (immediately) {
            //         // Cancel immediately
            //         await stripe.subscriptions.cancel(subscriptionRecord.stripeSubscriptionId, {
            //             invoice_now: false,
            //             prorate: true
            //         });
            //
            //         // Update our database
            //         await SubscriptionModel.findByIdAndUpdate(
            //             subscriptionId,
            //             {
            //                 status: 'active',
            //                 cancelledAt: new Date(),
            //                 cancelReason,
            //                 prev_subscriptionStatus:"canceled",
            //                 cancelAtPeriodEnd: false,
            //                 pricingId: freePlan._id // Set to Free plan
            //             }
            //         );
            //
            //         // Update user to free account type
            //         await UserModel.findByIdAndUpdate(
            //             subscriptionRecord.userId,
            //             {
            //                 subscriptionStatus: 'cancelled',
            //                 accountType: 'free'
            //             }
            //         );
            //         await PortfolioModel.findOneAndUpdate(
            //             {
            //                 userId: subscriptionRecord.userId
            //             },
            //             {
            //                 $set: {
            //                     template: ""
            //                 }
            //             }
            //         )
            //     } else {
            //         // Cancel at period end
            //         const updatedStripeSubscription = await stripe.subscriptions.update(
            //             subscriptionRecord.stripeSubscriptionId,
            //             {
            //                 cancel_at_period_end: cancelAtPeriodEnd,
            //                 metadata: {
            //                     cancel_reason: cancelReason
            //                 }
            //             }
            //         );
            //
            //         // Update our database
            //         await SubscriptionModel.findByIdAndUpdate(
            //             subscriptionId,
            //             {
            //                 status: cancelAtPeriodEnd ? 'active' : 'cancelled',
            //                 cancelAtPeriodEnd: cancelAtPeriodEnd,
            //                 cancelReason,
            //                 cancelledAt: cancelAtPeriodEnd ? null : new Date()
            //             }
            //         );
            //         await PortfolioModel.findOneAndUpdate(
            //             {
            //                 userId: subscriptionRecord.userId
            //             },
            //             {
            //                 $unset: {
            //                     template: ""
            //                 }
            //             }
            //         )
            //         // If not cancelling at period end, revert to free plan immediately
            //         if (!cancelAtPeriodEnd) {
            //             await SubscriptionModel.findByIdAndUpdate(
            //                 subscriptionId,
            //                 {
            //                     status: 'active',
            //                     prev_subscriptionStatus: "canceled",
            //                     cancelledAt: new Date(),
            //                     pricingId: freePlan._id // Set to Free plan
            //                 }
            //             );
            //
            //             // Update user to free account type
            //             await UserModel.findByIdAndUpdate(
            //                 subscriptionRecord.userId,
            //                 {
            //                     subscriptionStatus: 'cancelled',
            //                     accountType: 'free'
            //                 }
            //             );
            //         }
            //         // If cancelling at period end, we'll let the scheduled check handle the reversion
            //     }
            //
            //
            //     await PortfolioModel.findOneAndUpdate(
            //         {
            //             userId: subscriptionRecord.userId
            //         },
            //         {
            //             $set: {
            //                 template: ""
            //             }
            //         }
            //     )
            //
            //     // Create a transaction record for the cancellation for audit purposes
            //     // await TransactionModel.create({
            //     //     userId: subscriptionRecord.userId,
            //     //     pricingId: subscriptionRecord.pricingId,
            //     //     reason: "subscription_cancellation",
            //     //     txnStatus: TxnStatus.COMPLETED,
            //     //     metadata: {
            //     //         subscriptionId: subscriptionId,
            //     //         cancelReason: cancelReason,
            //     //         cancelAtPeriodEnd: cancelAtPeriodEnd,
            //     //         cancelledImmediately: immediately,
            //     //         revertedToFreePlan: immediately || !cancelAtPeriodEnd
            //     //     }
            //     // });
            //
            //     return {
            //         message: immediately
            //             ? "Subscription cancelled immediately and reverted to Free plan"
            //             : cancelAtPeriodEnd
            //                 ? "Subscription will be cancelled at the end of the billing period"
            //                 : "Subscription cancelled successfully and reverted to Free plan",
            //         subscriptionId: subscriptionId
            //     };
            //
            // } catch (stripeError: any) {
            //     console.error("Stripe cancellation error:", stripeError);
            //
            //     throw new CustomError({
            //         message: `Failed to cancel subscription in payment provider: ${stripeError.message}`,
            //         code: StatusCodes.BAD_REQUEST
            //     });
            // }
        }
        // Handle Paystack subscription cancellation
        if (subscriptionRecord.paystackSubscriptionCode) {
            const payload = {
                subscriptionRecord: subscriptionRecord,
                subscriptionId: subscriptionRecord.paystackSubscriptionCode,
                freePlan: freePlan,
                immediately: true,
                cancelAtPeriodEnd: false,
                cancelReason: cancelReason
            };
            yield (0, utils_1.cancelPaystackSubscription)(payload);
            // // If there's no Stripe subscription (e.g., free plan), just update our records
            // await SubscriptionModel.findByIdAndUpdate(
            //     subscriptionId,
            //     {
            //         status: 'active',
            //         prev_subscriptionStatus: "canceled",
            //         cancelledAt: new Date(),
            //         cancelReason,
            //         pricingId: freePlan._id, // Set to Free plan
            //         storageSize: "",
            //         currentPeriodEnd:""
            //     }
            // );
            // await PortfolioModel.findOneAndUpdate(
            //     {
            //         userId: subscriptionRecord.userId
            //     },
            //     {
            //         $unset: {
            //             template: ""
            //         }
            //     }
            // )
            // // Update user to free account type
            // await UserModel.findByIdAndUpdate(
            //     subscriptionRecord.userId,
            //     {
            //         subscriptionStatus: 'cancelled',
            //         accountType: 'free'
            //     }
            // );
            // await PortfolioModel.findOneAndUpdate(
            //     {
            //         userId: subscriptionRecord.userId
            //     },
            //     {
            //         $unset: {
            //             template: ""
            //         }
            //     }
            // )
            //
            // try {
            //     if (immediately) {
            //         // Cancel immediately
            //         const result = await paystack.subscription.disable(
            //             subscriptionRecord.paystackSubscriptionCode,
            //             // subscriptionRecord.paystackEmailToken,
            //         );
            //
            //         // Update our database
            //         await SubscriptionModel.findByIdAndUpdate(
            //             subscriptionId,
            //             {
            //                 status: 'active',
            //                 cancelledAt: new Date(),
            //                 cancelReason,
            //                 prev_subscriptionStatus: "cancelled",
            //                 cancelAtPeriodEnd: false,
            //                 pricingId: freePlan._id, // Set to Free plan
            //                 storageSize: "",
            //             }
            //         );
            //
            //         // Update user to free account type
            //         await UserModel.findByIdAndUpdate(
            //             subscriptionRecord.userId,
            //             {
            //                 subscriptionStatus: 'cancelled',
            //                 accountType: 'free'
            //             }
            //         );
            //         await PortfolioModel.findOneAndUpdate(
            //             {
            //                 userId: subscriptionRecord?.userId
            //             },
            //             {
            //                 $unset: {
            //                     template: ""
            //                 }
            //             }
            //         )
            //     } else {
            //         // Cancel at period end
            //         const result = await paystack.subscription.disable(
            //             subscriptionRecord.paystackSubscriptionCode,
            //         );
            //
            //         // Update our database
            //         await SubscriptionModel.findByIdAndUpdate(
            //             subscriptionId,
            //             {
            //                 status: cancelAtPeriodEnd ? 'active' : 'cancelled',
            //                 cancelAtPeriodEnd: cancelAtPeriodEnd,
            //                 cancelReason,
            //                 cancelledAt: cancelAtPeriodEnd ? null : new Date()
            //             }
            //         );
            //
            //         // If not cancelling at period end, revert to free plan immediately
            //         if (!cancelAtPeriodEnd) {
            //             await SubscriptionModel.findByIdAndUpdate(
            //                 subscriptionId,
            //                 {
            //                     status: 'active',
            //                     prev_subscriptionStatus: "cancelled",
            //                     cancelledAt: new Date(),
            //                     pricingId: freePlan._id // Set to Free plan
            //                 }
            //             );
            //
            //             // Update user to free account type
            //             await UserModel.findByIdAndUpdate(
            //                 subscriptionRecord.userId,
            //                 {
            //                     subscriptionStatus: 'cancelled',
            //                     accountType: 'free'
            //                 }
            //             );
            //         }
            //         // If cancelling at period end, we'll let the scheduled check handle the reversion
            //     }
            //
            //     // Create a transaction record for the cancellation for audit purposes
            //     await TransactionModel.create({
            //         userId: subscriptionRecord.userId,
            //         pricingId: subscriptionRecord.pricingId,
            //         reason: "subscription_cancellation",
            //         txnStatus: TxnStatus.COMPLETED,
            //         metadata: {
            //             subscriptionId: subscriptionId,
            //             cancelReason: cancelReason,
            //             cancelAtPeriodEnd: cancelAtPeriodEnd,
            //             cancelledImmediately: immediately,
            //             revertedToFreePlan: immediately || !cancelAtPeriodEnd
            //         }
            //     });
            //     await PortfolioModel.findOneAndUpdate(
            //         {
            //             userId: subscriptionRecord.userId
            //         },
            //         {
            //             $unset: {
            //                 template: ""
            //             }
            //         }
            //     )
            //
            //     return {
            //         message: immediately
            //             ? "Subscription cancelled immediately and reverted to Free plan"
            //             : cancelAtPeriodEnd
            //                 ? "Subscription will be cancelled at the end of the billing period"
            //                 : "Subscription cancelled successfully and reverted to Free plan",
            //         subscriptionId: subscriptionId
            //     };
            //
            // } catch (paystackError: any) {
            //     console.error("Paystack cancellation error:", paystackError);
            //
            //     throw new CustomError({
            //         message: `Failed to cancel subscription in payment provider: ${paystackError.message}`,
            //         code: StatusCodes.SERVICE_UNAVAILABLE
            //     });
            // }
        }
        yield portfolio_model_1.default.findOneAndUpdate({
            userId: subscriptionRecord.userId
        }, {
            $unset: {
                template: ""
            }
        });
        const userDetails = yield user_model_1.default.findOne({
            userId: subscriptionRecord.userId,
        }).lean().exec();
        const mail_amount = (subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.interval) === "monthly" ? (_a = subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.pricingId) === null || _a === void 0 ? void 0 : _a.amount : (_b = subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.pricingId) === null || _b === void 0 ? void 0 : _b.yearly_amount;
        const dashboardUrl = "https://staging.fotolocker.io/";
        yield new App_1.EmailService().subscriptionCancellationNotificationMail("Subscription notification", userDetails === null || userDetails === void 0 ? void 0 : userDetails.email, userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name, (_c = subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.pricingId) === null || _c === void 0 ? void 0 : _c.plan, mapStripeStatusToTxnStatus("active"), mail_amount, subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.interval, subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.startDate, subscriptionRecord === null || subscriptionRecord === void 0 ? void 0 : subscriptionRecord.startDate, dashboardUrl);
        // If we reach here, we don't have a payment provider subscription to cancel
        return {
            message: "Subscription updated successfully",
            subscriptionId: subscriptionId
        };
    }
    catch (error) {
        console.error("Subscription cancellation error:", error);
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || "Failed to cancel subscription",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.cancelSubscriptionService = cancelSubscriptionService;
const cancelPaystackSubscriptionService = (subscriptionId_1, ...args_1) => __awaiter(void 0, [subscriptionId_1, ...args_1], void 0, function* (subscriptionId, options = {}) {
    try {
        // Set default options
        const { cancelAtPeriodEnd = false, cancelReason = 'user_requested', immediately = true } = options;
        if (!subscriptionId) {
            throw new App_1.CustomError({
                message: `Subscription id is missing`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Find the subscription in our database
        const subscriptionRecord = yield subscription_model_1.default.findById(subscriptionId);
        if (!subscriptionRecord) {
            throw new App_1.CustomError({
                message: "Subscription not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        // Check if subscription is already cancelled
        if (subscriptionRecord.status === 'cancelled') {
            throw new App_1.CustomError({
                message: "Subscription is already cancelled",
                code: http_status_codes_1.StatusCodes.CONFLICT
            });
        }
        // Find the Free pricing plan for reverting users after cancellation
        const freePlan = yield pricing_model_1.default.findOne({ plan: "Free" });
        if (!freePlan) {
            throw new App_1.CustomError({
                message: "Free plan pricing not found",
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
        yield portfolio_model_1.default.findOneAndUpdate({
            userId: subscriptionRecord.userId
        }, {
            $unset: {
                template: ""
            }
        });
        // Check if we have a Stripe subscription ID
        if (subscriptionRecord.paystackSubscriptionCode) {
            // If there's no Stripe subscription (e.g., free plan), just update our records
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                status: 'active',
                prev_subscriptionStatus: "canceled",
                cancelledAt: new Date(),
                cancelReason,
                pricingId: freePlan._id, // Set to Free plan
                storageSize: "",
            });
            // Update user to free account type
            yield user_model_1.default.findByIdAndUpdate(subscriptionRecord.userId, {
                subscriptionStatus: 'cancelled',
                accountType: 'free'
            });
            // Cancel the subscription in Stripe
            try {
                if (immediately) {
                    // Cancel immediately
                    const result = yield paystack_1.paystack.subscription.disable(subscriptionRecord.paystackSubscriptionCode);
                    // Update our database
                    yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                        status: 'cancelled',
                        cancelledAt: new Date(),
                        cancelReason,
                        cancelAtPeriodEnd: false,
                        pricingId: freePlan._id, // Set to Free plan
                        storageSize: "",
                    });
                    // Update user to free account type
                    yield user_model_1.default.findByIdAndUpdate(subscriptionRecord.userId, {
                        subscriptionStatus: 'cancelled',
                        accountType: 'free'
                    });
                }
                else {
                    // Cancel at period end
                    const result = yield paystack_1.paystack.subscription.disable(subscriptionRecord.paystackSubscriptionCode);
                    // Update our database
                    yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                        status: cancelAtPeriodEnd ? 'active' : 'cancelled',
                        cancelAtPeriodEnd: cancelAtPeriodEnd,
                        cancelReason,
                        cancelledAt: cancelAtPeriodEnd ? null : new Date()
                    });
                    // If not cancelling at period end, revert to free plan immediately
                    if (!cancelAtPeriodEnd) {
                        yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
                            status: 'cancelled',
                            cancelledAt: new Date(),
                            pricingId: freePlan._id // Set to Free plan
                        });
                        // Update user to free account type
                        yield user_model_1.default.findByIdAndUpdate(subscriptionRecord.userId, {
                            subscriptionStatus: 'cancelled',
                            accountType: 'free'
                        });
                    }
                    // If cancelling at period end, we'll let the scheduled check handle the reversion
                }
                // Create a transaction record for the cancellation for audit purposes
                yield transaction_model_1.TransactionModel.create({
                    userId: subscriptionRecord.userId,
                    pricingId: subscriptionRecord.pricingId,
                    reason: "subscription_cancellation",
                    txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
                    metadata: {
                        subscriptionId: subscriptionId,
                        cancelReason: cancelReason,
                        cancelAtPeriodEnd: cancelAtPeriodEnd,
                        cancelledImmediately: immediately,
                        revertedToFreePlan: immediately || !cancelAtPeriodEnd
                    }
                });
                return {
                    message: immediately
                        ? "Subscription cancelled immediately and reverted to Free plan"
                        : cancelAtPeriodEnd
                            ? "Subscription will be cancelled at the end of the billing period"
                            : "Subscription cancelled successfully and reverted to Free plan",
                    subscriptionId: subscriptionId
                };
            }
            catch (stripeError) {
                console.error("Stripe cancellation error:", stripeError);
                throw new App_1.CustomError({
                    message: `Failed to cancel subscription in payment provider: ${stripeError.message}`,
                    code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE
                });
            }
            return {
                message: "Subscription cancelled successfully",
                subscriptionId: subscriptionId
            };
        }
    }
    catch (error) {
        console.error("Subscription cancellation error:", error);
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || "Failed to cancel subscription",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.cancelPaystackSubscriptionService = cancelPaystackSubscriptionService;
const paystackSubscriptionService = (args, ip) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const txnReference = (0, reference_1.default)(args.userId);
        const pricingDetails = yield pricing_model_1.default.findOne({
            _id: args.pricingId
        }).lean().exec();
        if (!pricingDetails) {
            throw new App_1.CustomError({
                message: "Invalid pricing details",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const userDetails = yield user_model_1.default.findOne({
            _id: args.userId,
        });
        if (!userDetails) {
            throw new App_1.CustomError({
                message: "User not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const now = new Date();
        const recentTimeframe = new Date(now);
        recentTimeframe.setMinutes(recentTimeframe.getMinutes() - 24); // this should be 24 hours not 5 minutes
        const transactExist = yield transaction_model_1.TransactionModel.findOne({
            userId: args.userId,
            pricingId: args.pricingId,
            createdAt: { $gte: recentTimeframe }
        });
        // if transaction is pending delete that record and create a new record
        if ((transactExist === null || transactExist === void 0 ? void 0 : transactExist.txnStatus) === transaction_interface_1.TxnStatus.PENDING) {
            yield transaction_model_1.TransactionModel.findOneAndDelete({
                userId: args.userId,
                pricingId: args.pricingId,
            });
        }
        if ((transactExist === null || transactExist === void 0 ? void 0 : transactExist.txnReference) === txnReference) {
            throw new App_1.CustomError({
                message: 'Duplicate transaction detected',
                code: http_status_codes_1.StatusCodes.CONFLICT,
            });
        }
        // Check for existing subscription
        const existingSubscription = yield subscription_model_1.default.findOne({
            userId: args.userId,
            status: { $in: ['active', 'pending', 'expired', 'canceled'] }
        }).lean().exec();
        // Handle existing subscription - update instead of throwing error
        let subscriptionRecord;
        if (existingSubscription) {
            if (existingSubscription.pricingId.toString() !== args.pricingId.toString() || existingSubscription.status !== transaction_interface_1.TxnStatus.COMPLETED) {
                const existingPlanDetails = yield pricing_model_1.default.findOne({
                    _id: existingSubscription.pricingId
                }).lean().exec();
                const isUpgradeFromFreePlan = (existingPlanDetails === null || existingPlanDetails === void 0 ? void 0 : existingPlanDetails.plan) === 'Free';
                if (isUpgradeFromFreePlan || true) {
                    const createdDate = new Date();
                    const expiryDate = new Date(createdDate);
                    if (args.interval === 'yearly') {
                        // expiryDate.setMinutes(expiryDate.getMinutes() + 2);
                        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                    }
                    else {
                        expiryDate.setMonth(expiryDate.getMonth() + 1);
                        // expiryDate.setMinutes(expiryDate.getMinutes() + 2); // this should be 1 month not 5 minutes
                    }
                    // Update the existing subscription with new pricing ID and set status to pending
                    subscriptionRecord = yield subscription_model_1.default.findByIdAndUpdate(existingSubscription._id, {
                        // pricingId: args.pricingId,
                        // status: 'pending',
                        startDate: createdDate,
                        currentPeriodEnd: expiryDate,
                        nextBillingDate: expiryDate,
                        upgradeWillCancelAt: expiryDate
                        // interval: args.interval,
                    }, { new: true });
                    // If previous subscription was active but not free, we might need
                    // to cancel the previous subscription in Paystack
                    if (existingSubscription.status === 'active' &&
                        !isUpgradeFromFreePlan &&
                        existingSubscription.paystackSubscriptionCode) {
                        try {
                            // Cancel the previous subscription in Paystack
                            yield paystack_1.paystack.subscription.disable({
                                code: existingSubscription.paystackSubscriptionCode,
                                token: existingSubscription.paystackEmailToken
                            });
                        }
                        catch (cancelError) {
                            console.error("Error cancelling previous subscription:", cancelError);
                            // Continue with the process even if cancellation fails
                        }
                    }
                }
                else {
                    throw new App_1.CustomError({
                        message: 'User already has an active subscription. Use forceUpdate flag to change plans.',
                        code: http_status_codes_1.StatusCodes.CONFLICT,
                    });
                }
            }
            else {
                throw new App_1.CustomError({
                    message: 'User already has an active subscription to this plan',
                    code: http_status_codes_1.StatusCodes.CONFLICT,
                });
            }
        }
        else {
            // Create a new subscription record if no existing subscription
            const createdDate = new Date();
            const expiryDate = new Date(createdDate);
            if (args.interval === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }
            else {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            }
            subscriptionRecord = yield subscription_model_1.default.create(Object.assign(Object.assign({}, args), { status: 'pending', startDate: createdDate, currentPeriodEnd: expiryDate, nextBillingDate: expiryDate, upgradeWillCancelAt: expiryDate, interval: args.interval }));
        }
        const billingDetails = yield billing_model_1.BillingModel.findOne({
            user_id: args.userId,
        });
        const currency = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.currency) || args.currency || 'NGN';
        const country = (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country) || 'NG';
        const intervalAmount = args.interval === "monthly" ? pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.ngAmount : pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.ngYearAmount;
        // Convert amount to proper type
        const amount = Number(intervalAmount);
        const amountInNaira = parseFloat(intervalAmount) * 1000;
        const amountInKobo = Math.round(amountInNaira * 100);
        // Create transaction document
        const payment_payload = {
            userId: args.userId,
            pricingId: args.pricingId,
            email: userDetails.email,
            amount: amount.toString(),
            packageType: pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.plan,
            reason: "subscription",
            currency: currency,
            provider: "paystack",
            txnStatus: transaction_interface_1.TxnStatus.PENDING,
            paymentMethods: args.paymentMethod || 'card',
        };
        // Create transaction record
        const paymentInit = yield transaction_model_1.TransactionModel.create(payment_payload);
        try {
            // Get or create Paystack plan
            const planCode = yield getOrCreatePaystackPlan({
                name: `${pricingDetails === null || pricingDetails === void 0 ? void 0 : pricingDetails.plan}`,
                amount: amount, // Convert to kobo/cents
                interval: args.interval === 'yearly' ? 'annually' : 'monthly',
                description: `${pricingDetails.plan} Plan - ${args.interval} billing`
            });
            if (!planCode) {
                throw new App_1.CustomError({
                    message: "Failed to create or retrieve subscription plan",
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                });
            }
            const paystackTransaction = yield paystack_1.paystack.transaction.initialize({
                email: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email,
                amount: amount,
                reference: txnReference,
                name: userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name,
                plan: planCode,
                currency: "NGN",
                callback_url: `${process.env.FRONTEND_URL}/dashboard`,
                metadata: {
                    userId: args.userId.toString(),
                    transactionId: paymentInit._id.toString(),
                    subscriptionId: subscriptionRecord._id.toString(),
                    pricingId: args.pricingId.toString(),
                    interval: args.interval,
                    storageSize: args.storageSize,
                },
            });
            // Update transaction with Paystack reference
            yield transaction_model_1.TransactionModel.findByIdAndUpdate(paymentInit._id, {
                txnReference: txnReference,
                paystackReference: (_a = paystackTransaction === null || paystackTransaction === void 0 ? void 0 : paystackTransaction.data) === null || _a === void 0 ? void 0 : _a.reference,
                paystackAccessCode: (_b = paystackTransaction === null || paystackTransaction === void 0 ? void 0 : paystackTransaction.data) === null || _b === void 0 ? void 0 : _b.access_code,
                pendingSubscriptionData: {
                    planCode,
                    currency,
                    interval: args.interval || 'monthly'
                },
                txnStatus: transaction_interface_1.TxnStatus.PROCESSING
            });
            // Update subscription with Paystack reference
            yield subscription_model_1.default.findByIdAndUpdate(subscriptionRecord._id, {
                status: "active",
                payment_provider: "paystack",
                paystackReference: (_c = paystackTransaction === null || paystackTransaction === void 0 ? void 0 : paystackTransaction.data) === null || _c === void 0 ? void 0 : _c.reference
            });
            return {
                authorizationUrl: (_d = paystackTransaction === null || paystackTransaction === void 0 ? void 0 : paystackTransaction.data) === null || _d === void 0 ? void 0 : _d.authorization_url,
                // reference: paystackTransaction?.data?.reference,
                // transactionId: paymentInit?._id,
                // subscriptionId: subscriptionRecord?._id
            };
        }
        catch (paystackError) {
            console.error("Paystack API error:", paystackError);
            yield transaction_model_1.TransactionModel.findByIdAndDelete(paymentInit._id);
            if (!existingSubscription) {
                yield subscription_model_1.default.findByIdAndDelete(subscriptionRecord._id);
            }
            else if (existingSubscription.pricingId.toString() !== args.pricingId.toString()) {
                // Revert subscription changes if updating an existing one
                yield subscription_model_1.default.findByIdAndUpdate(subscriptionRecord._id, {
                    pricingId: existingSubscription.pricingId,
                    status: existingSubscription.status
                });
            }
            throw new App_1.CustomError({
                message: `Payment processing failed: ${paystackError.message || "Unknown error"}`,
                code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE,
            });
        }
    }
    catch (error) {
        console.error("Subscription service error:", error);
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || "Failed to process subscription",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.paystackSubscriptionService = paystackSubscriptionService;
// Helper function to get or create a Paystack plan
const getOrCreatePaystackPlan = (planData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingPlans = yield paystack_1.paystack.plan.list();
        console.log(existingPlans);
        // Add validation to check if the response and data exist
        if (!existingPlans || !existingPlans.data || !Array.isArray(existingPlans.data)) {
            console.error("Invalid response from Paystack plan.list():", existingPlans);
            throw new Error("Failed to retrieve plans from Paystack");
        }
        const existingPlan = existingPlans.data.find((plan) => plan.name.toLowerCase() === planData.name.toLowerCase() &&
            plan.amount === (planData.amount * 100) &&
            plan.interval.toLowerCase() === planData.interval.toLowerCase() &&
            !plan.is_deleted &&
            !plan.is_archived &&
            Array.isArray(plan.subscriptions) &&
            plan.subscriptions.length === 0);
        if (existingPlan) {
            yield pricing_model_1.default.findOneAndUpdate({ plan: planData.name }, { planCode: existingPlan.plan_code }, { new: true });
            return existingPlan.plan_code;
        }
        const newPlan = yield paystack_1.paystack.plan.create({
            name: planData.name,
            amount: planData.amount * 100,
            interval: planData.interval,
            description: planData.description
        });
        // Add validation for the create response too
        if (!newPlan || !newPlan.data || !newPlan.data.plan_code) {
            console.error("Invalid response from Paystack plan.create():", newPlan);
            throw new Error("Failed to create plan in Paystack");
        }
        yield pricing_model_1.default.findOneAndUpdate({ plan: planData.name }, { planCode: newPlan.data.plan_code }, { new: true });
        return newPlan.data.plan_code;
    }
    catch (error) {
        console.error("Error in getOrCreatePaystackPlan:", error);
        throw error; // Re-throw instead of returning null to propagate the error properly
    }
});

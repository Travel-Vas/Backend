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
exports.ExtraPaymentService = exports.transactionHistoryService = exports.handleSubscriptionCallback = exports.paystackWebhookService = exports.stripWebhookService2 = exports.stripWebhookService = exports.initExtraPaymentService = exports.initPaymentService = void 0;
const transaction_interface_1 = require("./transaction.interface");
const transaction_model_1 = require("./transaction.model");
const stripe_1 = __importDefault(require("../../utils/stripe"));
const stripe_currency_setup_1 = __importDefault(require("../../utils/stripe_currency_setup"));
const billing_model_1 = require("../payment/billing.model");
const App_1 = require("../../helpers/lib/App");
// import {ShootsModel} from "../photoshoots/shoots.model";
const user_model_1 = __importDefault(require("../users/user.model"));
const http_status_codes_1 = require("http-status-codes");
// import SubscriptionModel from "../subscription/subscription.model";
// import {handleSetupIntentSucceeded} from "../subscription/subscription.service";
const wallet_model_1 = require("../wallet/wallet.model");
const intent_function_1 = require("../../utils/intent.function");
const paystack_1 = require("../../utils/paystack");
const initPaymentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const payment_payload = {
        userId: payload.userId,
        clientId: payload.clientId,
        shootId: payload.shootId,
        email: payload.email,
        amount: payload.amount,
        packageType: payload.packageType,
        noOfPhotos: payload.noOfPhotos,
        reason: payload.reason,
        txnStatus: transaction_interface_1.TxnStatus.PENDING,
        paymentMethods: payload.paymentMethods,
    };
    const billingDetials = yield billing_model_1.BillingModel.findOne({
        user_id: payload.userId,
    });
    const paymentInit = yield transaction_model_1.TransactionModel.create(payment_payload);
    const availablePaymentMethods = (0, stripe_currency_setup_1.default)(Number(payload.amount), payload.currency, (billingDetials === null || billingDetials === void 0 ? void 0 : billingDetials.country) ? billingDetials.country : 'usa');
    const payment_method_types = payload.paymentMethods
        ? payload.paymentMethods.filter((method) => availablePaymentMethods.includes(method))
        : availablePaymentMethods;
    const paymentIntent = yield stripe_1.default.paymentIntents.create({
        amount: Math.round(Number(payload.amount) * 100), // Convert to cents
        currency: payload.currency.toLowerCase() || 'usd', // or your preferred currency
        payment_method_types: payment_method_types || ['card'],
        metadata: {
            transactionId: paymentInit._id.toString(),
            userId: payload.userId,
            shootId: payload.shootId
        },
        description: `Payment for ${payload.packageType} - ${payload.noOfPhotos} photos`,
        receipt_email: payload.email
    });
    // Update transaction with Stripe PaymentIntent ID
    yield transaction_model_1.TransactionModel.findByIdAndUpdate(paymentInit._id, {
        stripePaymentIntentId: paymentIntent.id
    }, { new: true });
    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: paymentInit._id,
        availablePaymentMethods: payment_method_types
    };
});
exports.initPaymentService = initPaymentService;
const initExtraPaymentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const payment_payload = {
        userId: payload.userId,
        clientId: payload.clientId,
        shootId: payload.shootId,
        email: payload.email,
        amount: payload.amount,
        packageType: transaction_interface_1.PackageTypes.EXTRA_PHOTOS,
        noOfPhotos: payload.noOfPhotos,
        reason: payload.reason,
        txnStatus: transaction_interface_1.TxnStatus.PENDING,
        paymentMethods: payload.paymentMethods,
    };
    const shootsDetails = yield ShootsModel.findOne({
        _id: payload.shootId
    });
    if (!shootsDetails) {
        throw new App_1.CustomError({
            message: 'Invalid shoot id provided',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (shootsDetails.access_key !== payload.accessKey) {
        throw new App_1.CustomError({
            message: 'Invalid access key provided',
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    }
    let user;
    if (shootsDetails) {
        const userDetails = yield user_model_1.default.findOne({
            _id: shootsDetails === null || shootsDetails === void 0 ? void 0 : shootsDetails.user_id
        });
        user = userDetails;
    }
    const billingDetials = yield billing_model_1.BillingModel.findOne({
        user_id: user === null || user === void 0 ? void 0 : user._id,
    });
    const transactExist = yield transaction_model_1.TransactionModel.findOne({
        shootId: payload.shootId,
    });
    if (transactExist) {
        throw new App_1.CustomError({
            message: 'Duplicate transaction dictected',
            code: http_status_codes_1.StatusCodes.CONFLICT,
        });
    }
    const newPayload = Object.assign(Object.assign({}, payment_payload), { userId: user._id, amount: user.extra_picture_price });
    const paymentInit = yield transaction_model_1.TransactionModel.create(newPayload);
    const availablePaymentMethods = (0, stripe_currency_setup_1.default)(Number(payload.amount), user.currency || 'ngn', (billingDetials === null || billingDetials === void 0 ? void 0 : billingDetials.country) ? billingDetials.country : 'ng');
    let paymentIntent;
    const payment_method_types = payload.paymentMethods
        ? Array(payload.paymentMethods).filter((method) => availablePaymentMethods.includes(method))
        : availablePaymentMethods;
    try {
        const response = yield stripe_1.default.paymentIntents.create({
            amount: Math.round(parseFloat(newPayload === null || newPayload === void 0 ? void 0 : newPayload.amount) * 100), // Convert to cents
            currency: (user === null || user === void 0 ? void 0 : user.currency) && user.currency.toLowerCase() || 'usd', // or your preferred currency
            payment_method_types: payment_method_types || ['card'],
            metadata: {
                transactionId: paymentInit._id.toString(),
                userId: payload.userId,
                shootId: payload.shootId
            },
            description: `Payment for ${payload.packageType} - ${payload.noOfPhotos} photos`,
            receipt_email: payload.email
        });
        paymentIntent = response;
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
    // // Update transaction with Stripe PaymentIntent ID
    yield transaction_model_1.TransactionModel.findByIdAndUpdate(paymentInit._id, {
        stripePaymentIntentId: paymentIntent.id
    }, { new: true });
    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: paymentInit._id,
        availablePaymentMethods: payment_method_types
    };
});
exports.initExtraPaymentService = initExtraPaymentService;
const stripWebhookService = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
    try {
        console.log(event === null || event === void 0 ? void 0 : event.type);
        switch (event.type) {
            case 'setup_intent.succeeded': {
                const setupIntent = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.object;
                console.log(setupIntent);
                const paymentIntent = event.data.object;
                const transactionId = (_b = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.transactionId;
                ;
                const shootId = (_c = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _c === void 0 ? void 0 : _c.shootId;
                const subscriptionId = (_d = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _d === void 0 ? void 0 : _d.subscriptionId;
                const pricingId = (_e = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _e === void 0 ? void 0 : _e.pricingId;
                const walletId = (_f = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _f === void 0 ? void 0 : _f.walletId;
                const subscription = event.data.object;
                // Process the successful setup intent
                try {
                    // Update transaction status
                    const transactionId = (_g = setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.metadata) === null || _g === void 0 ? void 0 : _g.transactionId;
                    if (transactionId) {
                        yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                            txnStatus: transaction_interface_1.TxnStatus.PROCESSING,
                            stripeSubscriptionId: setupIntent.id,
                            paymentMethod: setupIntent.payment_method_types[0]
                        });
                    }
                    // Update subscription status
                    const subscriptionId = (_h = setupIntent === null || setupIntent === void 0 ? void 0 : setupIntent.metadata) === null || _h === void 0 ? void 0 : _h.subscriptionId;
                    if (subscriptionId) {
                        yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                            status: 'active'
                        });
                    }
                    // await handleSetupIntentSucceeded(setupIntent, pricingId);
                }
                catch (error) {
                    console.error('Error handling setup intent success:', error);
                    // Update transaction with error
                    const transactionId = (_j = setupIntent.metadata) === null || _j === void 0 ? void 0 : _j.transactionId;
                    if (transactionId) {
                        yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                            txnStatus: transaction_interface_1.TxnStatus.FAILED,
                            reason: `Setup successful but subscription creation failed: ${error.message || 'Unknown error'}`
                        });
                    }
                }
                break;
            }
            case 'customer.subscription.created': {
                const subscription = event.data.object;
                // console.log(subscription)
                const subscriptionId = (_k = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _k === void 0 ? void 0 : _k.subscriptionId;
                const transactionId = (_l = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _l === void 0 ? void 0 : _l.transactionId;
                const userId = (_m = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _m === void 0 ? void 0 : _m.userId;
                const pricingId = (_o = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _o === void 0 ? void 0 : _o.pricingId;
                if (subscriptionId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer,
                        status: "active", // 'incomplete', 'active', etc.
                        // currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        createdAt: new Date(subscription.created * 1000)
                    });
                }
                if (transactionId) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                        txnStatus: transaction_interface_1.TxnStatus.PENDING,
                        stripeSubscriptionId: subscription.id
                    });
                }
                // await handleSetupIntentSucceeded(subscription, pricingId);
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = (_p = event === null || event === void 0 ? void 0 : event.data) === null || _p === void 0 ? void 0 : _p.object;
                const metadata = (invoice === null || invoice === void 0 ? void 0 : invoice.metadata) || {};
                const subscriptionId = metadata.subscriptionId;
                const pricingId = metadata.pricingId || ((_r = (_q = invoice === null || invoice === void 0 ? void 0 : invoice.subscription) === null || _q === void 0 ? void 0 : _q.metadata) === null || _r === void 0 ? void 0 : _r.pricingId);
                const interval = metadata.interval;
                const subscription = yield SubscriptionModel.findOne({
                    _id: subscriptionId
                });
                if (subscription && subscription.status === 'active') {
                    const now = new Date();
                    let nextBillingDate = new Date(now);
                    let currentPeriodEnd = new Date(now);
                    if (interval === 'monthly') {
                        nextBillingDate.setDate(now.getDate() + 30);
                        currentPeriodEnd.setDate(now.getDate() + 30);
                    }
                    else if (interval === 'yearly') {
                        nextBillingDate.setFullYear(now.getFullYear() + 1);
                        currentPeriodEnd.setFullYear(now.getFullYear() + 1);
                    }
                    else {
                        // fallback: use Stripe's period_end timestamp
                        const stripePeriodEnd = invoice === null || invoice === void 0 ? void 0 : invoice.period_end;
                        if (stripePeriodEnd) {
                            currentPeriodEnd = new Date(stripePeriodEnd * 1000);
                            nextBillingDate = new Date(stripePeriodEnd * 1000);
                        }
                    }
                    yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
                        currentPeriodEnd,
                        nextBillingDate,
                        pricingId,
                        status: 'active',
                        lastPaymentDate: now,
                        startDate: now
                    });
                    const transactionId = metadata.transactionId;
                    if (transactionId) {
                        yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                            txnStatus: transaction_interface_1.TxnStatus.COMPLETED
                        });
                    }
                    yield handleSetupIntentSucceeded(invoice, pricingId);
                }
                break;
            }
            case 'payment_intent.succeeded': {
                const paymentIntent = (_s = event === null || event === void 0 ? void 0 : event.data) === null || _s === void 0 ? void 0 : _s.object;
                if (!(paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata)) {
                    return;
                }
                const transactionId = (_t = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _t === void 0 ? void 0 : _t.transactionId;
                const shootId = (_u = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _u === void 0 ? void 0 : _u.shootId;
                const subscriptionId = (_v = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _v === void 0 ? void 0 : _v.subscriptionId;
                const pricingId = (_w = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _w === void 0 ? void 0 : _w.pricingId;
                const setupIntent = (_x = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _x === void 0 ? void 0 : _x.setupIntent;
                const walletId = (_y = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _y === void 0 ? void 0 : _y.walletId;
                const storageSize = (_z = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _z === void 0 ? void 0 : _z.storageSize;
                const interval = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata.interval;
                if (!paymentIntent.metadata) {
                    return;
                }
                if (pricingId && subscriptionId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        status: 'active',
                        pricingId: pricingId,
                        interval: interval
                    });
                }
                // await handleSetupIntentSucceeded(paymentIntent, pricingId);
                // Update transaction status
                const transaction = yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                    txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
                    stripeSubscriptionId: paymentIntent.id,
                    paymentMethod: paymentIntent.payment_method_types[0],
                    completedAt: new Date()
                }, { new: true });
                const subscriptionsId = (_0 = setupIntent.metadata) === null || _0 === void 0 ? void 0 : _0.subscriptionId;
                if (subscriptionsId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionsId, {
                        status: 'active',
                        pricingId: pricingId
                    });
                }
                yield handleSetupIntentSucceeded(setupIntent, pricingId);
                // update user shoots details
                const transactionDetails = yield transaction_model_1.TransactionModel.findOne({
                    $or: [
                        { shootId: shootId },
                        { subscriptionId: subscriptionId }
                    ]
                });
                if (storageSize && subscriptionId) {
                    yield transaction_model_1.TransactionModel.findOneAndUpdate({
                        _id: transactionId,
                    }, {
                        txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
                        completedAt: new Date()
                    }, { new: true });
                    // Get existing storage
                    const existing = yield SubscriptionModel.findOne({
                        _id: subscriptionId,
                    });
                    //     update storage space
                    let parsedExistingStorage, addition;
                    const parsed = (0, intent_function_1.parseStorageSizeWithUnit)(storageSize);
                    if (existing === null || existing === void 0 ? void 0 : existing.storageSize) {
                        parsedExistingStorage = (0, intent_function_1.parseStorageSizeWithUnit)(existing.storageSize);
                        addition = parsedExistingStorage.size + parsed.size;
                    }
                    else {
                        addition = parsed.size + 3;
                    }
                    const record = `${addition}GB`;
                    // console.log("new record here", record)
                    const result = yield SubscriptionModel.findOneAndUpdate({
                        _id: subscriptionId,
                    }, {
                        status: "active",
                        storageSize: record || "3GB",
                    }, {
                        new: true
                    });
                    console.log("new record here", result);
                }
                if (shootId) {
                    const shoot = yield ShootsModel.findById(shootId);
                    if (shoot) {
                        const currentMaxPictures = shoot.max_pictures || 0;
                        const additionalPhotos = (transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.noOfPhotos) || 0;
                        yield ShootsModel.findByIdAndUpdate(shootId, {
                            $set: {
                                max_pictures: currentMaxPictures + additionalPhotos
                            }
                        }, { new: true });
                        console.log(`Updated shoot ${shootId} with ${additionalPhotos} additional photos. New total: ${currentMaxPictures + additionalPhotos}`);
                    }
                    else {
                        console.error(`Shoot not found for ID: ${shootId}`);
                    }
                }
                if (subscriptionId) {
                    // const subscription = await SubscriptionModel.findById(subscriptionId);
                    //
                    // if (subscription) {
                    //     const status = subscription.status;
                    //
                    //     await SubscriptionModel.findByIdAndUpdate(
                    //         subscriptionId,
                    //         {
                    //             $set: {
                    //                 status: pstatus.active
                    //             }
                    //         },
                    //         { new: true }
                    //     );
                    //
                    //     console.log(`Updated shoot ${subscriptionId} with ${status}`);
                    // } else {
                    //     console.error(`Shoot not found for ID: ${shootId}`);
                    // }
                    yield handleSetupIntentSucceeded(setupIntent, pricingId);
                }
                if (walletId) {
                    const amount = paymentIntent.amount / 100;
                    const wallet = yield wallet_model_1.WalletModel.findOne({
                        _id: walletId,
                        status: 'active'
                    }).lean().exec();
                    const oldBalance = wallet === null || wallet === void 0 ? void 0 : wallet.balance;
                    const newBalance = oldBalance + amount;
                    wallet.balance = newBalance;
                    yield wallet_model_1.WalletModel.findOneAndUpdate({ _id: walletId }, { $set: { balance: newBalance } });
                    yield wallet_model_1.LedgerModel.create([{
                            walletId: wallet._id,
                            transactionId: transactionId,
                            type: 'credit',
                            amount: amount,
                            balanceBefore: oldBalance,
                            balanceAfter: newBalance,
                            description: `Deposit of ${amount} ${wallet.currency}`,
                        }]);
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent.metadata.transactionId;
                const storageSize = (_1 = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _1 === void 0 ? void 0 : _1.storageSize;
                // Update transaction status to failed
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                    txnStatus: transaction_interface_1.TxnStatus.FAILED,
                    reason: ((_2 = paymentIntent.last_payment_error) === null || _2 === void 0 ? void 0 : _2.message) || 'Payment failed',
                    failedAt: new Date()
                });
                break;
            }
            case 'payment_intent.created': {
                const paymentIntent = event.data.object;
                const transactionId = ((_3 = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _3 === void 0 ? void 0 : _3.transactionId) || ((_5 = (_4 = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.subscription_details) === null || _4 === void 0 ? void 0 : _4.metadata) === null || _5 === void 0 ? void 0 : _5.transactionId);
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                    txnStatus: transaction_interface_1.TxnStatus.PENDING,
                    stripePaymentId: paymentIntent.id
                });
                break;
            }
            case 'payment_intent.processing': {
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent.metadata.transactionId;
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                    txnStatus: transaction_interface_1.TxnStatus.PROCESSING,
                    stripePaymentId: paymentIntent.id
                });
                break;
            }
            case 'payment_intent.requires_action': {
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent.metadata.transactionId;
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                    txnStatus: transaction_interface_1.TxnStatus.REQUIRES_ACTION,
                    nextAction: ((_6 = paymentIntent.next_action) === null || _6 === void 0 ? void 0 : _6.type) || 'customer_action_required'
                });
                break;
            }
            case 'payment_intent.cancelled': {
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent.metadata.transactionId;
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                    txnStatus: transaction_interface_1.TxnStatus.CANCELLED,
                    reason: 'Payment cancelled',
                    cancelledAt: new Date()
                });
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object;
                // Find transaction by payment intent ID
                const transaction = yield transaction_model_1.TransactionModel.findOne({
                    stripePaymentId: charge.payment_intent
                });
                if (transaction) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, {
                        txnStatus: transaction_interface_1.TxnStatus.REFUNDED,
                        refundedAmount: charge.amount_refunded / 100, // Convert from cents
                        refundedAt: new Date()
                    });
                }
                break;
            }
            case 'charge.dispute.created': {
                const dispute = event.data.object;
                const transaction = yield transaction_model_1.TransactionModel.findOne({
                    stripePaymentId: dispute.payment_intent
                });
                if (transaction) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, {
                        txnStatus: transaction_interface_1.TxnStatus.DISPUTED,
                        disputeReason: dispute.reason,
                        disputeCreatedAt: new Date()
                    });
                }
                break;
            }
            case 'charge.dispute.closed': {
                const dispute = event.data.object;
                const transaction = yield transaction_model_1.TransactionModel.findOne({
                    stripePaymentId: dispute.payment_intent
                });
                if (transaction) {
                    let newStatus = transaction_interface_1.TxnStatus.COMPLETED;
                    if (dispute.status === 'lost') {
                        newStatus = transaction_interface_1.TxnStatus.REFUNDED;
                    }
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, {
                        txnStatus: newStatus,
                        disputeStatus: dispute.status,
                        disputeClosedAt: new Date()
                    });
                }
                break;
            }
            case 'customer.subscription.updated':
                const subscription = (_7 = event === null || event === void 0 ? void 0 : event.data) === null || _7 === void 0 ? void 0 : _7.object;
                const transactionId = (_8 = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _8 === void 0 ? void 0 : _8.transactionId;
                const subscriptionId = (_9 = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _9 === void 0 ? void 0 : _9.subscriptionId;
                const pricingId = (_10 = subscription === null || subscription === void 0 ? void 0 : subscription.metadata) === null || _10 === void 0 ? void 0 : _10.pricingId;
                const interval = ((_11 = subscription === null || subscription === void 0 ? void 0 : subscription.plan) === null || _11 === void 0 ? void 0 : _11.interval) === 'month' ? 'monthly' : 'yearly';
                if (pricingId && subscriptionId) {
                    const now = new Date();
                    let nextBillingDate = new Date(now);
                    let currentPeriodEnd = new Date(now);
                    if (interval === 'monthly') {
                        nextBillingDate.setDate(now.getDate() + 30);
                        currentPeriodEnd.setDate(now.getDate() + 30);
                    }
                    else if (interval === 'yearly') {
                        nextBillingDate.setFullYear(now.getFullYear() + 1);
                        currentPeriodEnd.setFullYear(now.getFullYear() + 1);
                    }
                    else {
                        // fallback: use Stripe's period_end timestamp
                        const stripePeriodEnd = subscription === null || subscription === void 0 ? void 0 : subscription.period_end;
                        if (stripePeriodEnd) {
                            currentPeriodEnd = new Date(stripePeriodEnd * 1000);
                            nextBillingDate = new Date(stripePeriodEnd * 1000);
                        }
                    }
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        status: 'active',
                        pricingId: pricingId,
                        interval: interval,
                        startDate: now,
                        currentPeriodEnd: currentPeriodEnd,
                        nextBillingDate: nextBillingDate,
                    });
                }
                yield handleSetupIntentSucceeded(subscription, pricingId);
                break;
            case 'checkout.session.completed':
                const paymentIntent = event.data.object;
                const transactionsId = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata.transactionId;
                const shootId = (_12 = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _12 === void 0 ? void 0 : _12.shootId;
                const usersId = (_13 = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _13 === void 0 ? void 0 : _13.userId;
                const subscriptionsId = (_14 = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _14 === void 0 ? void 0 : _14.subscriptionId;
                const transactionDetails = yield transaction_model_1.TransactionModel.findOne({
                    $or: [
                        { shootId: shootId },
                        { subscriptionId: subscriptionsId },
                    ]
                });
                if (shootId) {
                    const shoot = yield ShootsModel.findById(shootId);
                    if (shoot) {
                        const currentMaxPictures = shoot.max_pictures || 0;
                        const additionalPhotos = Number((transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.noOfPhotos) || 0);
                        yield ShootsModel.findByIdAndUpdate(shootId, {
                            $set: {
                                max_pictures: currentMaxPictures + additionalPhotos
                            }
                        }, { new: true });
                        console.log(`Updated shoot ${shootId} with ${additionalPhotos} additional photos. New total: ${currentMaxPictures + additionalPhotos}`);
                    }
                    else {
                        console.error(`Shoot not found for ID: ${shootId}`);
                    }
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate({
                        transactionsId
                    }, {
                        txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
                    }).lean().exec();
                }
                //     update user Wallet
                const userWallet = yield wallet_model_1.WalletModel.findOne({
                    userId: usersId
                });
                const prevBal = userWallet === null || userWallet === void 0 ? void 0 : userWallet.balance;
                const newBal = prevBal + ((_15 = event === null || event === void 0 ? void 0 : event.data) === null || _15 === void 0 ? void 0 : _15.amount_total);
                yield wallet_model_1.WalletModel.findOneAndUpdate({
                    userId: usersId
                }, {
                    balance: newBal
                }, {
                    new: true
                }).lean();
            default:
                console.log('Unhandled webhook event:', event);
                let normalizedData = event.data;
                const transactionIds = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.transactionId;
                if (!transactionIds) {
                    console.error('No transactionId found in webhook data');
                    return;
                }
                const transaction = yield transaction_model_1.TransactionModel.findOne({
                    _id: transactionIds
                }).lean().exec();
                if (!transaction) {
                    console.error('No transaction found with transactionId:', transactionIds);
                    throw new Error('Transaction not found for transactionId');
                }
                // Update the transaction status to completed
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, { txnStatus: transaction_interface_1.TxnStatus.FAILED });
        }
        return true;
    }
    catch (e) {
        console.log(`Webhook error: ${e}`);
        throw new App_1.CustomError({
            message: `Webhook error: ${e.message}`,
            code: 500,
        });
    }
});
exports.stripWebhookService = stripWebhookService;
const stripWebhookService2 = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    try {
        switch (event.type) {
            // SUBSCRIPTION LIFECYCLE EVENTS
            case 'customer.subscription.created': {
                const subscription = event.data.object;
                const subscriptionId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.subscriptionId;
                const transactionId = (_b = subscription.metadata) === null || _b === void 0 ? void 0 : _b.transactionId;
                const userId = (_c = subscription.metadata) === null || _c === void 0 ? void 0 : _c.userId;
                const pricingId = (_d = subscription.metadata) === null || _d === void 0 ? void 0 : _d.pricingId;
                if (subscriptionId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer,
                        status: subscription.status, // 'incomplete', 'active', etc.
                        // currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        // currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        createdAt: new Date(subscription.created * 1000)
                    });
                }
                if (transactionId) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                        txnStatus: subscription.status === 'active' ? transaction_interface_1.TxnStatus.COMPLETED : transaction_interface_1.TxnStatus.PENDING,
                        stripeSubscriptionId: subscription.id
                    });
                }
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const subscriptionId = (_e = subscription.metadata) === null || _e === void 0 ? void 0 : _e.subscriptionId;
                if (subscriptionId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        status: subscription.status,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
                        endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const subscriptionId = (_f = subscription.metadata) === null || _f === void 0 ? void 0 : _f.subscriptionId;
                const transactionId = (_g = subscription.metadata) === null || _g === void 0 ? void 0 : _g.transactionId;
                if (subscriptionId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        status: 'canceled',
                        canceledAt: new Date(),
                        endedAt: new Date(subscription.ended_at * 1000)
                    });
                }
                if (transactionId) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                        txnStatus: transaction_interface_1.TxnStatus.CANCELLED,
                        reason: 'Subscription canceled',
                        cancelledAt: new Date()
                    });
                }
                break;
            }
            // INVOICE EVENTS (MOST IMPORTANT FOR RECURRING PAYMENTS)
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                // Find subscription by Stripe subscription ID
                const subscription = yield SubscriptionModel.findOne({
                    stripeSubscriptionId: subscriptionId
                });
                if (subscription) {
                    // Update subscription status and period
                    yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
                        status: 'active',
                        currentPeriodStart: new Date(invoice.period_start * 1000),
                        currentPeriodEnd: new Date(invoice.period_end * 1000),
                        lastPaymentDate: new Date()
                    });
                    // Create transaction record for this payment
                    const transactionData = {
                        userId: subscription.userId,
                        subscriptionId: subscription._id,
                        amount: invoice.amount_paid / 100,
                        currency: invoice.currency,
                        txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
                        stripeInvoiceId: invoice.id,
                        stripeSubscriptionId: subscriptionId,
                        completedAt: new Date(),
                        description: `Subscription payment for period ${new Date(invoice.period_start * 1000).toDateString()} - ${new Date(invoice.period_end * 1000).toDateString()}`
                    };
                    yield transaction_model_1.TransactionModel.create(transactionData);
                }
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                const subscription = yield SubscriptionModel.findOne({
                    stripeSubscriptionId: subscriptionId
                });
                if (subscription) {
                    yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
                        status: 'past_due',
                        lastPaymentAttempt: new Date(),
                        paymentFailureReason: ((_h = invoice.last_payment_error) === null || _h === void 0 ? void 0 : _h.message) || 'Payment failed'
                    });
                    // Create failed transaction record
                    const transactionData = {
                        userId: subscription.userId,
                        subscriptionId: subscription._id,
                        amount: invoice.amount_due / 100,
                        currency: invoice.currency,
                        txnStatus: transaction_interface_1.TxnStatus.FAILED,
                        stripeInvoiceId: invoice.id,
                        stripeSubscriptionId: subscriptionId,
                        failedAt: new Date(),
                        reason: ((_j = invoice.last_payment_error) === null || _j === void 0 ? void 0 : _j.message) || 'Payment failed'
                    };
                    yield transaction_model_1.TransactionModel.create(transactionData);
                }
                break;
            }
            case 'invoice.upcoming': {
                // This fires 3 days before renewal - good for sending notifications
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                const subscription = yield SubscriptionModel.findOne({
                    stripeSubscriptionId: subscriptionId
                });
                if (subscription) {
                    // Send renewal notification to user
                    console.log(`Subscription renewal coming up for subscription: ${subscription._id}`);
                    // Add your notification logic here
                }
                break;
            }
            case 'invoice.created': {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                const subscription = yield SubscriptionModel.findOne({
                    stripeSubscriptionId: subscriptionId
                });
                if (subscription) {
                    yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
                        nextInvoiceDate: new Date(invoice.period_end * 1000)
                    });
                }
                break;
            }
            // SETUP INTENT FOR PAYMENT METHOD SETUP
            case 'setup_intent.succeeded': {
                const setupIntent = event.data.object;
                const subscriptionId = (_k = setupIntent.metadata) === null || _k === void 0 ? void 0 : _k.subscriptionId;
                const transactionId = (_l = setupIntent.metadata) === null || _l === void 0 ? void 0 : _l.transactionId;
                const pricingId = (_m = setupIntent.metadata) === null || _m === void 0 ? void 0 : _m.pricingId;
                if (subscriptionId) {
                    yield SubscriptionModel.findByIdAndUpdate(subscriptionId, {
                        status: 'processing',
                        paymentMethodId: setupIntent.payment_method
                    });
                }
                if (transactionId) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                        txnStatus: transaction_interface_1.TxnStatus.PROCESSING,
                        stripeSetupIntentId: setupIntent.id,
                        paymentMethod: setupIntent.payment_method_types[0]
                    });
                }
                // Handle setup intent succeeded logic
                if (pricingId) {
                    yield handleSetupIntentSucceeded(setupIntent, pricingId);
                }
                break;
            }
            // PAYMENT METHOD EVENTS
            case 'payment_method.attached': {
                const paymentMethod = event.data.object;
                const customerId = paymentMethod.customer;
                // Update subscription with new payment method if needed
                const subscription = yield SubscriptionModel.findOne({
                    stripeCustomerId: customerId
                });
                if (subscription) {
                    yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
                        paymentMethodId: paymentMethod.id,
                        paymentMethodType: paymentMethod.type
                    });
                }
                break;
            }
            // EXISTING ONE-TIME PAYMENT EVENTS (keep these for non-subscription payments)
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata.transactionId;
                const shootId = (_o = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _o === void 0 ? void 0 : _o.shootId;
                const walletId = (_p = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _p === void 0 ? void 0 : _p.walletId;
                const storageSize = (_q = paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.metadata) === null || _q === void 0 ? void 0 : _q.storageSize;
                // Handle one-time payments (non-subscription)
                if (transactionId && !((_r = paymentIntent.metadata) === null || _r === void 0 ? void 0 : _r.subscriptionId)) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                        txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
                        stripePaymentId: paymentIntent.id,
                        paymentMethod: paymentIntent.payment_method_types[0],
                        completedAt: new Date()
                    });
                    // Handle shoots, wallet, storage logic for one-time payments
                    if (shootId) {
                        const transactionDetails = yield transaction_model_1.TransactionModel.findById(transactionId);
                        const shoot = yield ShootsModel.findById(shootId);
                        if (shoot && transactionDetails) {
                            const currentMaxPictures = shoot.max_pictures || 0;
                            const additionalPhotos = transactionDetails.noOfPhotos || 0;
                            yield ShootsModel.findByIdAndUpdate(shootId, { max_pictures: currentMaxPictures + additionalPhotos });
                        }
                    }
                    if (walletId) {
                        const amount = paymentIntent.amount / 100;
                        const wallet = yield wallet_model_1.WalletModel.findById(walletId);
                        if (wallet) {
                            const oldBalance = wallet.balance || 0;
                            const newBalance = oldBalance + amount;
                            yield wallet_model_1.WalletModel.findByIdAndUpdate(walletId, { balance: newBalance });
                            yield wallet_model_1.LedgerModel.create({
                                walletId: wallet._id,
                                transactionId: transactionId,
                                type: 'credit',
                                amount: amount,
                                balanceBefore: oldBalance,
                                balanceAfter: newBalance,
                                description: `Deposit of ${amount} ${wallet.currency || 'USD'}`
                            });
                        }
                    }
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const transactionId = paymentIntent.metadata.transactionId;
                if (transactionId) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transactionId, {
                        txnStatus: transaction_interface_1.TxnStatus.FAILED,
                        reason: ((_s = paymentIntent.last_payment_error) === null || _s === void 0 ? void 0 : _s.message) || 'Payment failed',
                        failedAt: new Date()
                    });
                }
                break;
            }
            // Keep other existing cases for disputes, refunds, etc.
            case 'charge.refunded': {
                const charge = event.data.object;
                const transaction = yield transaction_model_1.TransactionModel.findOne({
                    stripePaymentId: charge.payment_intent
                });
                if (transaction) {
                    yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, {
                        txnStatus: transaction_interface_1.TxnStatus.REFUNDED,
                        refundedAmount: charge.amount_refunded / 100,
                        refundedAt: new Date()
                    });
                }
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        return true;
    }
    catch (e) {
        console.log(`Webhook error: ${e}`);
        throw new App_1.CustomError({
            message: `Webhook error: ${e.message}`,
            code: 500,
        });
    }
});
exports.stripWebhookService2 = stripWebhookService2;
const paystackWebhookService = (event, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (event) {
            case 'charge.success':
                yield handleSuccessfulCharge(data);
                break;
            case 'subscription.create':
                yield handleSubscriptionCreate(data);
                break;
            case 'subscription.disable':
                yield handleSubscriptionDisable(data);
                break;
            case 'invoice.payment_failed':
                yield handlePaymentFailed(data);
                break;
            default:
                console.log('Unhandled webhook event:', event);
                let normalizedData = data;
                const transactionId = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.transactionId;
                if (!transactionId) {
                    console.error('No transactionId found in webhook data');
                    return;
                }
                const transaction = yield transaction_model_1.TransactionModel.findOne({
                    _id: transactionId
                }).lean().exec();
                if (!transaction) {
                    console.error('No transaction found with transactionId:', transactionId);
                    throw new Error('Transaction not found for transactionId');
                }
                // Update the transaction status to completed
                yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, { txnStatus: transaction_interface_1.TxnStatus.FAILED });
        }
    }
    catch (error) {
        console.error('Webhook error:', error);
        return 'Webhook processed with errors';
    }
});
exports.paystackWebhookService = paystackWebhookService;
function handleSuccessfulCharge(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(data);
        let normalizedData = data;
        const subscriptionId = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.subscriptionId;
        const storageSize = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.storageSize;
        const pricingId = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.pricingId;
        const interval = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.interval;
        const transactionId = normalizedData === null || normalizedData === void 0 ? void 0 : normalizedData.metadata.transactionId;
        // Log the extracted transactionId for debugging
        // console.log("Extracted transactionId:", transactionId);
        let reference = null;
        let currentStatus = null;
        if (data.metadata_details) {
            currentStatus = normalizedData.metadata_details.status;
            reference = normalizedData.metadata_details.reference;
        }
        else if (normalizedData.metadata) {
            currentStatus = normalizedData.status;
            reference = normalizedData.reference;
        }
        if (!transactionId) {
            console.error('No transactionId found in webhook data');
            return;
        }
        const transaction = yield transaction_model_1.TransactionModel.findOne({
            _id: transactionId
        }).lean().exec();
        if (!transaction) {
            console.error('No transaction found with transactionId:', transactionId);
            throw new Error('Transaction not found for transactionId');
        }
        // Update the transaction status to completed
        yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction._id, { txnStatus: transaction_interface_1.TxnStatus.COMPLETED });
        // Handle subscription status updates
        if (currentStatus === "success" && subscriptionId) {
            yield SubscriptionModel.findOneAndUpdate({ _id: subscriptionId }, {
                status: "active",
                pricingId: pricingId,
                interval: interval,
            });
            if (reference && !storageSize) {
                yield (0, exports.handleSubscriptionCallback)(reference);
            }
        }
        // Handle storage size updates if provided
        if (currentStatus === "success" && storageSize && subscriptionId) {
            // Get existing storage
            const existing = yield SubscriptionModel.findOne({
                _id: subscriptionId,
            });
            // Update storage space
            let parsedExistingStorage, addition;
            const parsed = (0, intent_function_1.parseStorageSizeWithUnit)(storageSize);
            if (existing === null || existing === void 0 ? void 0 : existing.storageSize) {
                parsedExistingStorage = (0, intent_function_1.parseStorageSizeWithUnit)(existing.storageSize);
                addition = parsedExistingStorage + parsed.size;
            }
            else {
                addition = parsed.size + 3;
            }
            const record = `${addition}GB`;
            console.log("New storage size:", record);
            const result = yield SubscriptionModel.findOneAndUpdate({
                _id: subscriptionId,
            }, {
                status: "active",
                storageSize: record || "3GB"
            }, {
                new: true
            });
            console.log("Updated subscription:", result);
        }
        // Handle subscription renewal
        if (data.plan && data.subscription_code) {
            const subscription = yield SubscriptionModel.findOne({
                paystackSubscriptionCode: data.subscription_code
            });
            if (subscription) {
                const currentDate = new Date();
                const endDate = new Date(currentDate);
                if (subscription.interval === 'yearly') {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                else {
                    endDate.setMonth(endDate.getMonth() + 1);
                }
                yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
                    status: 'active',
                    currentPeriodStart: currentDate,
                    currentPeriodEnd: endDate,
                    nextBillingDate: endDate
                });
            }
        }
    });
}
function handleSubscriptionCreate(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Update the subscription with Paystack's subscription code
        yield SubscriptionModel.findOneAndUpdate({ paystackReference: data.reference }, {
            status: 'active',
            paystackSubscriptionCode: data.subscription_code,
            paystackEmailToken: data.email_token || null
        });
    });
}
function handleSubscriptionDisable(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Update subscription status when disabled
        yield SubscriptionModel.findOneAndUpdate({ paystackSubscriptionCode: data.subscription_code }, {
            status: 'canceled',
            cancelledAt: new Date()
        });
    });
}
function handlePaymentFailed(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Handle failed payments
        if (data.subscription_code) {
            yield SubscriptionModel.findOneAndUpdate({ paystackSubscriptionCode: data.subscription_code }, { status: 'expired' });
            // Create a failed transaction record
            if (data.customer && data.amount) {
                const subscription = yield SubscriptionModel.findOne({
                    paystackSubscriptionCode: data.subscription_code
                });
                if (subscription) {
                    yield transaction_model_1.TransactionModel.create({
                        userId: subscription.userId,
                        pricingId: subscription.pricingId,
                        email: data.customer.email,
                        amount: (data.amount / 100).toString(), // Convert back from kobo/cents
                        packageType: data.plan.name,
                        reason: "Failed Subscription Renewal",
                        currency: data.currency,
                        txnStatus: transaction_interface_1.TxnStatus.FAILED,
                        paymentMethods: "card",
                        paystackReference: data.reference || data.id
                    });
                }
            }
        }
    });
}
// subscription.service.ts (continued)
const handleSubscriptionCallback = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify the transaction
        const paystackResponse = yield paystack_1.paystack.transaction.verify(reference);
        if (paystackResponse.data.status !== 'success') {
            throw new App_1.CustomError({
                message: 'Payment failed',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        // Update transaction status
        yield transaction_model_1.TransactionModel.findOneAndUpdate({ paystackReference: reference }, { txnStatus: transaction_interface_1.TxnStatus.COMPLETED });
        // Get the subscription details
        const subscription = yield SubscriptionModel.findOne({
            paystackReference: reference
        }).populate('pricingId');
        if (!subscription) {
            throw new App_1.CustomError({
                message: 'Subscription not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        // Set subscription end date based on interval
        const currentDate = new Date();
        const endDate = new Date(currentDate);
        switch (subscription.interval) {
            // case 'daily':
            //     endDate.setDate(endDate.getDate() + 1);
            //     break;
            // case 'weekly':
            //     endDate.setDate(endDate.getDate() + 7);
            //     break;
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'quarterly':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            // case 'biannually':
            //     endDate.setMonth(endDate.getMonth() + 6);
            //     break;
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }
        // Update subscription with authorization code for future charges
        yield SubscriptionModel.findByIdAndUpdate(subscription._id, {
            status: 'active',
            currentPeriodStart: currentDate,
            currentPeriodEnd: endDate,
            nextBillingDate: endDate,
            paystackCustomerCode: paystackResponse.data.customer.customer_code,
            paystackAuthorizationCode: paystackResponse.data.authorization.authorization_code,
            paystackSubscriptionCode: paystackResponse.data.subscription_code || null
        });
        // Update user's storage allocation
        // const transaction:any = await TransactionModel.findOne({ paystackReference: reference });
        // if (transaction && transaction.metadata && transaction.metadata.storageSize) {
        //     await UserModel.findByIdAndUpdate(
        //         subscription.userId,
        //         { storageSize: transaction.metadata.storageSize }
        //     );
        // }
        return {
            success: true,
            message: "Subscription activated successfully",
            data: {
                subscriptionId: subscription._id,
                status: 'active',
                expiryDate: endDate
            }
        };
    }
    catch (error) {
        console.error('Subscription callback error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Subscription Callback Error',
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.handleSubscriptionCallback = handleSubscriptionCallback;
const transactionHistoryService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield transaction_model_1.TransactionModel.find({
        userId: userId,
    }).populate("clientId", "email name").sort({ createdAt: -1 }).lean().exec();
    return response;
});
exports.transactionHistoryService = transactionHistoryService;
const ExtraPaymentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const payment_payload = {
        userId: payload.userId,
        clientId: payload.clientId,
        shootId: payload.shootId,
        email: payload.email,
        amount: payload.amount,
        packageType: transaction_interface_1.PackageTypes.EXTRA_PHOTOS,
        noOfPhotos: payload.noOfPhotos,
        reason: payload.reason,
        txnStatus: transaction_interface_1.TxnStatus.PENDING,
        paymentMethods: payload.paymentMethods,
    };
    // Existing validation logic
    const shootsDetails = yield ShootsModel.findOne({
        _id: payload.shootId
    });
    if (!shootsDetails) {
        throw new App_1.CustomError({
            message: 'Invalid shoot id provided',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (shootsDetails.access_key !== payload.accessKey) {
        throw new App_1.CustomError({
            message: 'Invalid access key provided',
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    }
    let user;
    if (shootsDetails) {
        const userDetails = yield user_model_1.default.findOne({
            _id: shootsDetails === null || shootsDetails === void 0 ? void 0 : shootsDetails.user_id
        });
        user = userDetails;
    }
    const billingDetails = yield billing_model_1.BillingModel.findOne({
        user_id: user === null || user === void 0 ? void 0 : user._id,
    });
    const transactExist = yield transaction_model_1.TransactionModel.findOne({
        shootId: payload.shootId,
        packageType: transaction_interface_1.PackageTypes.EXTRA_PHOTOS,
        txnStatus: transaction_interface_1.TxnStatus.PENDING,
    });
    if (transactExist) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        const transactionTime = new Date(transactExist.createdAt || transactExist._id.getTimestamp());
        if (transactionTime > twoMinutesAgo) {
            throw new App_1.CustomError({
                message: 'Duplicate transaction detected',
                code: http_status_codes_1.StatusCodes.CONFLICT,
            });
        }
    }
    const newPayload = Object.assign(Object.assign({}, payment_payload), { userId: user._id, amount: user.extra_picture_price });
    const paymentInit = yield transaction_model_1.TransactionModel.create(newPayload);
    const availablePaymentMethods = (0, stripe_currency_setup_1.default)(Number(payload.amount), user.currency || 'ngn', (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country) ? billingDetails.country : 'ng');
    const payment_method_types = payload.paymentMethods
        ? Array(payload.paymentMethods).filter((method) => availablePaymentMethods.includes(method))
        : availablePaymentMethods;
    // Choose between hosted checkout or custom payment intent
    const checkoutType = payload.checkoutType || 'hosted';
    if (!user.extra_picture_price) {
        throw new App_1.CustomError({
            message: 'Please set your price',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (checkoutType === 'hosted') {
        // Use Stripe Checkout Session for hosted payment page
        try {
            const session = yield stripe_1.default.checkout.sessions.create({
                payment_method_types: payment_method_types || ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: ((_a = user === null || user === void 0 ? void 0 : user.currency) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'usd',
                            product_data: {
                                name: `Extra Photos - ${payload.noOfPhotos} photos`,
                                description: `Additional photos for shoot ${payload.shootId}`,
                                images: [], // Add your product images if available
                            },
                            unit_amount: Math.round(parseFloat(user.extra_picture_price) * 100),
                        },
                        quantity: Number(payload.noOfPhotos),
                    },
                ],
                mode: 'payment',
                success_url: payload.successUrl || `${process.env.FRONTEND_URL}/dashboard`,
                cancel_url: payload.cancelUrl || `${process.env.FRONTEND_URL}/dashboard`,
                customer_email: payload.email,
                client_reference_id: paymentInit._id.toString(),
                metadata: {
                    transactionId: paymentInit._id.toString(),
                    userId: payload.userId.toString(),
                    shootId: payload.shootId.toString(),
                    packageType: payload.packageType.toString(),
                    noOfPhotos: payload.noOfPhotos && payload.noOfPhotos.toString(),
                },
                payment_intent_data: {
                    description: `Payment for ${payload.packageType} - ${payload.noOfPhotos} photos`,
                    receipt_email: payload.email,
                },
                expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            });
            // Update transaction with Stripe Session ID
            yield transaction_model_1.TransactionModel.findByIdAndUpdate(paymentInit._id, {
                stripeSessionId: session.id,
                checkoutUrl: session.url,
            }, { new: true });
            return {
                checkoutUrl: session.url,
                sessionId: session.id,
                transactionId: paymentInit._id,
                availablePaymentMethods: payment_method_types,
                type: 'hosted_checkout'
            };
        }
        catch (error) {
            console.log('Stripe Checkout Error:', error);
            throw new App_1.CustomError({
                message: error.message,
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    }
    else {
        // Original PaymentIntent approach for custom checkout
        let paymentIntent;
        try {
            const response = yield stripe_1.default.paymentIntents.create({
                amount: Math.round(parseFloat(user === null || user === void 0 ? void 0 : user.extra_picture_price) * 100),
                currency: ((_b = user === null || user === void 0 ? void 0 : user.currency) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || 'usd',
                payment_method_types: payment_method_types || ['card'],
                metadata: {
                    transactionId: paymentInit._id.toString(),
                    userId: payload.userId,
                    shootId: payload.shootId
                },
                description: `Payment for ${payload.packageType} - ${payload.noOfPhotos} photos`,
                receipt_email: payload.email
            });
            paymentIntent = response;
        }
        catch (error) {
            console.log('PaymentIntent Error:', error);
            throw new App_1.CustomError({
                message: error.message,
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
        // Update transaction with Stripe PaymentIntent ID
        yield transaction_model_1.TransactionModel.findByIdAndUpdate(paymentInit._id, {
            stripePaymentIntentId: paymentIntent.id
        }, { new: true });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            transactionId: paymentInit._id,
            availablePaymentMethods: payment_method_types,
            type: 'custom_checkout'
        };
    }
});
exports.ExtraPaymentService = ExtraPaymentService;

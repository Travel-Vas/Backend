"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.paystackWebhookController = exports.processNextInstallmentController = exports.getPendingInstallmentsController = exports.getPaymentHistoryController = exports.verifyPaymentController = exports.initializeInstallmentPaymentController = exports.initializeFullPaymentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const payment_service_1 = require("./payment.service");
const booking_model_1 = require("./booking.model");
const crypto_1 = __importDefault(require("crypto"));
const initializeFullPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tripId, email } = req.body;
    const userId = req['user']._id;
    const paymentResponse = yield payment_service_1.PaymentService.initializeFullPayment(tripId, userId, email);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Payment initialized successfully",
        data: {
            authorization_url: paymentResponse.data.authorization_url,
            access_code: paymentResponse.data.access_code,
            reference: paymentResponse.data.reference
        },
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.initializeFullPaymentController = initializeFullPaymentController;
const initializeInstallmentPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripId, email, installmentCount, frequency } = req.body;
        const userId = req['user']._id;
        // Get trip cost to calculate installments
        const tripData = yield booking_model_1.Trip.findById(tripId);
        if (!tripData) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                msg: "Trip not found",
                data: null,
                statusCode: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const totalAmount = parseFloat(tripData.tripCost);
        const installmentData = {
            tripId,
            userId,
            totalAmount,
            installmentCount,
            installmentAmount: Math.ceil(totalAmount / installmentCount),
            frequency: frequency || 'monthly',
            email
        };
        const paymentResponse = yield payment_service_1.PaymentService.initializeInstallmentPayment(installmentData);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: "Installment payment initialized successfully",
            data: {
                authorization_url: paymentResponse.data.authorization_url,
                access_code: paymentResponse.data.access_code,
                reference: paymentResponse.data.reference,
                installmentDetails: {
                    totalAmount,
                    installmentCount,
                    installmentAmount: Math.ceil(totalAmount / installmentCount),
                    firstPayment: Math.ceil(totalAmount / installmentCount)
                }
            },
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to initialize installment payment",
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.initializeInstallmentPaymentController = initializeInstallmentPaymentController;
const verifyPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference } = req.params;
        const verificationResponse = yield payment_service_1.PaymentService.verifyPayment(reference);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: "Payment verification completed",
            data: {
                status: verificationResponse.data.status,
                reference: verificationResponse.data.reference,
                amount: verificationResponse.data.amount / 100, // Convert back to Naira
                paidAt: verificationResponse.data.paid_at,
                channel: verificationResponse.data.channel,
                customer: verificationResponse.data.customer
            },
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Payment verification failed",
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.verifyPaymentController = verifyPaymentController;
const getPaymentHistoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripId } = req.params;
        const userId = req['user']._id;
        const paymentHistory = yield payment_service_1.PaymentService.getPaymentHistory(tripId, userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: "Payment history retrieved successfully",
            data: paymentHistory,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to get payment history",
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getPaymentHistoryController = getPaymentHistoryController;
const getPendingInstallmentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req['user']._id;
        const pendingInstallments = yield payment_service_1.PaymentService.getPendingInstallments(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: "Pending installments retrieved successfully",
            data: pendingInstallments,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to get pending installments",
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getPendingInstallmentsController = getPendingInstallmentsController;
const processNextInstallmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId, email } = req.body;
        const paymentResponse = yield payment_service_1.PaymentService.processNextInstallment(paymentId, email);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: "Next installment initialized successfully",
            data: {
                authorization_url: paymentResponse.data.authorization_url,
                access_code: paymentResponse.data.access_code,
                reference: paymentResponse.data.reference
            },
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to process next installment",
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.processNextInstallmentController = processNextInstallmentController;
const paystackWebhookController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const startTime = Date.now();
    try {
        const payload = req.body;
        const signature = req.headers['x-paystack-signature'];
        // Verify webhook signature
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            console.error('[Webhook] PAYSTACK_SECRET_KEY not configured');
            return res.status(http_status_codes_1.StatusCodes.OK).send('OK');
        }
        const hash = crypto_1.default
            .createHmac('sha512', secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');
        if (hash !== signature) {
            console.error('[Webhook] Invalid signature', {
                event: payload.event,
                receivedSignature: (signature === null || signature === void 0 ? void 0 : signature.substring(0, 10)) + '...'
            });
            return res.status(http_status_codes_1.StatusCodes.OK).send('OK');
        }
        // Check if this is a Ghana trip payment by reference prefix
        const isGhanaTrip = (_b = (_a = payload.data) === null || _a === void 0 ? void 0 : _a.reference) === null || _b === void 0 ? void 0 : _b.startsWith('ghana_trip_');
        console.log('[Webhook] Event received:', {
            event: payload.event,
            eventId: (_c = payload.data) === null || _c === void 0 ? void 0 : _c.id,
            reference: (_d = payload.data) === null || _d === void 0 ? void 0 : _d.reference,
            handler: isGhanaTrip ? 'GhanaTripService' : 'PaymentService'
        });
        switch (payload.event) {
            case 'charge.success':
                if (isGhanaTrip) {
                    // Import GhanaTripService dynamically to avoid circular dependencies
                    const { GhanaTripService } = yield Promise.resolve().then(() => __importStar(require('../ghana_trip/ghana_trip.service')));
                    yield GhanaTripService.handlePaymentSuccess(payload.data);
                }
                else {
                    yield payment_service_1.PaymentService.handleChargeSuccess(payload.data);
                }
                break;
            case 'charge.failed':
                if (isGhanaTrip) {
                    const { GhanaTripService } = yield Promise.resolve().then(() => __importStar(require('../ghana_trip/ghana_trip.service')));
                    yield GhanaTripService.handlePaymentFailed(payload.data);
                }
                else {
                    yield payment_service_1.PaymentService.handleChargeFailed(payload.data);
                }
                break;
            case 'transfer.success':
                yield payment_service_1.PaymentService.handleTransferSuccess(payload.data);
                break;
            case 'transfer.failed':
            case 'transfer.reversed':
                yield payment_service_1.PaymentService.handleTransferFailed(payload.data);
                break;
            case 'refund.pending':
            case 'refund.processed':
            case 'refund.failed':
                yield payment_service_1.PaymentService.handleRefund(payload.event, payload.data);
                break;
            default:
                console.log('[Webhook] Unhandled event type:', payload.event);
        }
        const duration = Date.now() - startTime;
        console.log('[Webhook] Processed successfully', {
            event: payload.event,
            duration: `${duration}ms`
        });
        res.status(http_status_codes_1.StatusCodes.OK).send('OK');
    }
    catch (error) {
        const duration = Date.now() - startTime;
        console.error('[Webhook] Error:', {
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
        // Always respond with 200 to prevent Paystack from retrying
        res.status(http_status_codes_1.StatusCodes.OK).send('OK');
    }
});
exports.paystackWebhookController = paystackWebhookController;

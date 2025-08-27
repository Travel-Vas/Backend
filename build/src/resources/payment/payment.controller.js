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
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackWebhookController = exports.processNextInstallmentController = exports.getPendingInstallmentsController = exports.getPaymentHistoryController = exports.verifyPaymentController = exports.initializeInstallmentPaymentController = exports.initializeFullPaymentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const payment_service_1 = require("./payment.service");
const App_1 = require("../../helpers/lib/App");
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
    const { tripId, email, installmentCount, frequency } = req.body;
    const userId = req['user']._id;
    // Get trip cost to calculate installments
    const trip = yield payment_service_1.PaymentService.getPaymentHistory(tripId, userId);
    if (!trip.length) {
        throw new App_1.CustomError({
            message: "Trip not found",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // For now, we'll get the trip cost from the trip model
    // In a real scenario, you might want to pass totalAmount in the request
    const { Trip } = require('../booking/booking.model');
    const tripData = yield Trip.findById(tripId);
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
});
exports.initializeInstallmentPaymentController = initializeInstallmentPaymentController;
const verifyPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.verifyPaymentController = verifyPaymentController;
const getPaymentHistoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tripId } = req.params;
    const userId = req['user']._id;
    const paymentHistory = yield payment_service_1.PaymentService.getPaymentHistory(tripId, userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Payment history retrieved successfully",
        data: paymentHistory,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getPaymentHistoryController = getPaymentHistoryController;
const getPendingInstallmentsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const pendingInstallments = yield payment_service_1.PaymentService.getPendingInstallments(userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Pending installments retrieved successfully",
        data: pendingInstallments,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getPendingInstallmentsController = getPendingInstallmentsController;
const processNextInstallmentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.processNextInstallmentController = processNextInstallmentController;
const paystackWebhookController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        // Verify webhook signature (implement based on Paystack documentation)
        const signature = req.headers['x-paystack-signature'];
        if (payload.event === 'charge.success') {
            const reference = payload.data.reference;
            yield payment_service_1.PaymentService.verifyPayment(reference);
        }
        res.status(http_status_codes_1.StatusCodes.OK).send('OK');
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(http_status_codes_1.StatusCodes.OK).send('OK'); // Always respond with 200 to Paystack
    }
});
exports.paystackWebhookController = paystackWebhookController;

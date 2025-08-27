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
exports.PaymentService = void 0;
const paystack_1 = require("../../utils/paystack");
const payment_model_1 = require("./payment.model");
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("./payment.interface");
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const uuid_1 = require("uuid");
class PaymentService {
    /**
     * Initialize full payment for a trip
     */
    static initializeFullPayment(tripId, userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trip = yield booking_model_1.Trip.findById(tripId);
                if (!trip) {
                    throw new App_1.CustomError({
                        message: 'Trip not found',
                        code: http_status_codes_1.StatusCodes.NOT_FOUND
                    });
                }
                const amount = parseFloat(trip.tripCost) * 100; // Convert to kobo
                const reference = `trip_full_${tripId}_${(0, uuid_1.v4)()}`;
                // Initialize payment with Paystack
                const paymentData = {
                    email,
                    amount,
                    reference,
                    currency: 'NGN',
                    metadata: {
                        tripId,
                        userId,
                        paymentType: payment_interface_1.PaymentType.FULL,
                        tripName: trip.name,
                        destination: trip.destination
                    }
                };
                const response = yield paystack_1.paystack.transaction.initialize(paymentData);
                if (!response.status) {
                    throw new App_1.CustomError({
                        message: 'Failed to initialize payment',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                // Save payment record
                yield payment_model_1.Payment.create({
                    tripId,
                    userId,
                    reference,
                    amount: amount / 100, // Store in Naira
                    paymentType: payment_interface_1.PaymentType.FULL,
                    status: payment_interface_1.PaymentStatus.PENDING,
                    metadata: paymentData.metadata
                });
                return response;
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: error.message || 'Failed to initialize payment',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Initialize installment payment plan for a trip
     */
    static initializeInstallmentPayment(installmentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tripId, userId, totalAmount, installmentCount, email } = installmentData;
                const trip = yield booking_model_1.Trip.findById(tripId);
                if (!trip) {
                    throw new App_1.CustomError({
                        message: 'Trip not found',
                        code: http_status_codes_1.StatusCodes.NOT_FOUND
                    });
                }
                const installmentAmount = Math.ceil(totalAmount / installmentCount);
                const firstInstallmentAmount = installmentAmount * 100; // Convert to kobo
                const reference = `trip_install_1_${tripId}_${(0, uuid_1.v4)()}`;
                // Initialize first installment payment
                const paymentData = {
                    email,
                    amount: firstInstallmentAmount,
                    reference,
                    currency: 'NGN',
                    metadata: {
                        tripId,
                        userId,
                        paymentType: payment_interface_1.PaymentType.INSTALLMENT,
                        installmentNumber: 1,
                        totalInstallments: installmentCount,
                        totalAmount,
                        installmentAmount,
                        tripName: trip.name,
                        destination: trip.destination
                    }
                };
                const response = yield paystack_1.paystack.transaction.initialize(paymentData);
                if (!response.status) {
                    throw new App_1.CustomError({
                        message: 'Failed to initialize installment payment',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                // Calculate next payment date (30 days from now for monthly)
                const nextPaymentDate = new Date();
                nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
                // Save payment record
                yield payment_model_1.Payment.create({
                    tripId,
                    userId,
                    reference,
                    amount: installmentAmount,
                    totalAmount,
                    installmentNumber: 1,
                    totalInstallments: installmentCount,
                    paymentType: payment_interface_1.PaymentType.INSTALLMENT,
                    status: payment_interface_1.PaymentStatus.PENDING,
                    nextPaymentDate: installmentCount > 1 ? nextPaymentDate : undefined,
                    metadata: paymentData.metadata
                });
                return response;
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: error.message || 'Failed to initialize installment payment',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Verify payment with Paystack
     */
    static verifyPayment(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield paystack_1.paystack.transaction.verify(reference);
                if (!response.status) {
                    throw new App_1.CustomError({
                        message: 'Payment verification failed',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                // Update payment record
                const payment = yield payment_model_1.Payment.findOne({ reference });
                if (payment) {
                    payment.status = response.data.status === 'success' ? payment_interface_1.PaymentStatus.SUCCESS : payment_interface_1.PaymentStatus.FAILED;
                    payment.paystackResponse = response.data;
                    if (response.data.status === 'success') {
                        payment.paidAt = new Date(response.data.paid_at);
                    }
                    yield payment.save();
                    // If this is a successful installment payment, create next installment record
                    if (payment.paymentType === payment_interface_1.PaymentType.INSTALLMENT &&
                        payment.status === payment_interface_1.PaymentStatus.SUCCESS &&
                        payment.installmentNumber < payment.totalInstallments) {
                        yield this.createNextInstallmentRecord(payment);
                    }
                }
                return response;
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: error.message || 'Payment verification failed',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Create next installment payment record
     */
    static createNextInstallmentRecord(currentPayment) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextInstallmentNumber = currentPayment.installmentNumber + 1;
            const nextReference = `trip_install_${nextInstallmentNumber}_${currentPayment.tripId}_${(0, uuid_1.v4)()}`;
            // Calculate next payment date (30 days from current payment)
            const nextPaymentDate = new Date(currentPayment.paidAt);
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
            yield payment_model_1.Payment.create({
                tripId: currentPayment.tripId,
                userId: currentPayment.userId,
                reference: nextReference,
                amount: currentPayment.amount,
                totalAmount: currentPayment.totalAmount,
                installmentNumber: nextInstallmentNumber,
                totalInstallments: currentPayment.totalInstallments,
                paymentType: payment_interface_1.PaymentType.INSTALLMENT,
                status: payment_interface_1.PaymentStatus.PENDING,
                nextPaymentDate: nextInstallmentNumber < currentPayment.totalInstallments ?
                    new Date(nextPaymentDate.getTime() + (30 * 24 * 60 * 60 * 1000)) : undefined,
                metadata: currentPayment.metadata
            });
        });
    }
    /**
     * Get payment history for a trip
     */
    static getPaymentHistory(tripId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield payment_model_1.Payment.find({ tripId, userId })
                    .sort({ createdAt: -1 })
                    .populate('tripId', 'name destination tripCost');
            }
            catch (error) {
                throw new App_1.CustomError({
                    message: 'Failed to fetch payment history',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Get pending installments for a user
     */
    static getPendingInstallments(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = new Date();
                return yield payment_model_1.Payment.find({
                    userId,
                    paymentType: payment_interface_1.PaymentType.INSTALLMENT,
                    status: payment_interface_1.PaymentStatus.PENDING,
                    nextPaymentDate: { $lte: today }
                }).populate('tripId', 'name destination tripCost');
            }
            catch (error) {
                throw new App_1.CustomError({
                    message: 'Failed to fetch pending installments',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Process next installment payment
     */
    static processNextInstallment(paymentId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payment = yield payment_model_1.Payment.findById(paymentId);
                if (!payment) {
                    throw new App_1.CustomError({
                        message: 'Payment record not found',
                        code: http_status_codes_1.StatusCodes.NOT_FOUND
                    });
                }
                if (payment.status !== payment_interface_1.PaymentStatus.PENDING) {
                    throw new App_1.CustomError({
                        message: 'Payment is not pending',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                const amount = payment.amount * 100; // Convert to kobo
                const paymentData = {
                    email,
                    amount,
                    reference: payment.reference,
                    currency: 'NGN',
                    metadata: payment.metadata
                };
                const response = yield paystack_1.paystack.transaction.initialize(paymentData);
                if (!response.status) {
                    throw new App_1.CustomError({
                        message: 'Failed to initialize installment payment',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                return response;
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: error.message || 'Failed to process installment payment',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
}
exports.PaymentService = PaymentService;

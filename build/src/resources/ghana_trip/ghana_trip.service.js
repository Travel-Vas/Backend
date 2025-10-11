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
exports.GhanaTripService = void 0;
const paystack_1 = require("../../utils/paystack");
const ghana_trip_model_1 = require("./ghana_trip.model");
const payment_model_1 = require("../booking/payment.model");
const payment_interface_1 = require("../booking/payment.interface");
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const uuid_1 = require("uuid");
class GhanaTripService {
    /**
     * Create Ghana trip booking and initialize payment
     */
    static createBookingAndInitializePayment(bookingData, userId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate user ID and email
                if (!userId) {
                    throw new App_1.CustomError({
                        message: 'User ID is required',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                if (!email) {
                    throw new App_1.CustomError({
                        message: 'Email is required',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                // Set user ID and email
                bookingData.userId = userId;
                bookingData.email = email;
                // Generate payment reference
                const reference = `ghana_trip_${(0, uuid_1.v4)()}`;
                bookingData.paymentReference = reference;
                bookingData.paymentStatus = 'pending';
                // Create Ghana trip booking record
                const ghanaTrip = yield ghana_trip_model_1.GhanaTrip.create(bookingData);
                // Initialize payment with Paystack
                const amount = Math.round(bookingData.pricing.total * 100); // Convert to kobo
                const paymentData = {
                    email,
                    amount,
                    name: `Ghana Tech Expo Trip - ${bookingData.bookingData.flowType}`,
                    reference,
                    currency: 'NGN',
                    callback_url: `${process.env.APP_URL}/dashboard`,
                    metadata: {
                        bookingId: ghanaTrip._id.toString(),
                        userId,
                        flowType: bookingData.bookingData.flowType,
                        transportType: bookingData.bookingData.transport.type,
                        toursCount: bookingData.bookingData.selectedTours.length,
                        hasConferenceHotel: !!bookingData.bookingData.conferenceHotel,
                        roomSharing: bookingData.bookingData.roomSharing,
                        intraCityLogistics: bookingData.bookingData.intraCityLogistics
                    }
                };
                const paystackResponse = yield paystack_1.paystack.transaction.initialize(paymentData);
                if (!paystackResponse || !paystackResponse.status) {
                    throw new App_1.CustomError({
                        message: 'Failed to initialize payment with Paystack',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                // Save payment record in Payment collection
                yield payment_model_1.Payment.create({
                    tripId: ghanaTrip._id,
                    userId,
                    reference,
                    amount: bookingData.pricing.total,
                    paymentType: payment_interface_1.PaymentType.FULL,
                    status: payment_interface_1.PaymentStatus.PENDING,
                    metadata: paymentData.metadata
                });
                return {
                    bookingId: ghanaTrip._id,
                    paymentDetails: {
                        authorization_url: paystackResponse.data.authorization_url,
                        access_code: paystackResponse.data.access_code,
                        reference: paystackResponse.data.reference
                    },
                    pricing: bookingData.pricing
                };
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: error.message || 'Failed to create booking and initialize payment',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Verify payment and update booking status
     */
    static verifyPayment(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Verify with Paystack
                const paystackResponse = yield paystack_1.paystack.transaction.verify(reference);
                if (!paystackResponse || !paystackResponse.status) {
                    throw new App_1.CustomError({
                        message: 'Payment verification failed',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST
                    });
                }
                // Find booking by reference
                const booking = yield ghana_trip_model_1.GhanaTrip.findOne({ paymentReference: reference });
                if (!booking) {
                    throw new App_1.CustomError({
                        message: 'Booking not found',
                        code: http_status_codes_1.StatusCodes.NOT_FOUND
                    });
                }
                // Update booking status
                const isSuccess = paystackResponse.data.status === 'success';
                booking.paymentStatus = isSuccess ? 'success' : 'failed';
                booking.paystackResponse = paystackResponse.data;
                if (isSuccess) {
                    booking.paidAt = new Date(paystackResponse.data.paid_at);
                }
                yield booking.save();
                // Update payment record
                const payment = yield payment_model_1.Payment.findOne({ reference });
                if (payment) {
                    payment.status = isSuccess ? payment_interface_1.PaymentStatus.SUCCESS : payment_interface_1.PaymentStatus.FAILED;
                    payment.paystackResponse = paystackResponse.data;
                    if (isSuccess) {
                        payment.paidAt = new Date(paystackResponse.data.paid_at);
                    }
                    yield payment.save();
                }
                return {
                    status: paystackResponse.data.status,
                    reference: paystackResponse.data.reference,
                    amount: paystackResponse.data.amount / 100,
                    paidAt: paystackResponse.data.paid_at,
                    booking: {
                        id: booking._id,
                        flowType: booking.bookingData.flowType,
                        pricing: booking.pricing
                    }
                };
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
     * Get booking by ID (User - own bookings only)
     */
    static getBookingById(bookingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield ghana_trip_model_1.GhanaTrip.findOne({ _id: bookingId, userId })
                    .populate('userId', 'firstName lastName email phoneNumber');
                if (!booking) {
                    throw new App_1.CustomError({
                        message: 'Booking not found',
                        code: http_status_codes_1.StatusCodes.NOT_FOUND
                    });
                }
                return booking;
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: 'Failed to fetch booking',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Get booking by ID (Admin - any booking)
     */
    static getBookingByIdAdmin(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield ghana_trip_model_1.GhanaTrip.findById(bookingId)
                    .populate('userId', 'firstName lastName email phoneNumber');
                if (!booking) {
                    throw new App_1.CustomError({
                        message: 'Booking not found',
                        code: http_status_codes_1.StatusCodes.NOT_FOUND
                    });
                }
                return booking;
            }
            catch (error) {
                if (error instanceof App_1.CustomError)
                    throw error;
                throw new App_1.CustomError({
                    message: 'Failed to fetch booking',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Get all bookings for a user
     */
    static getUserBookings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ghana_trip_model_1.GhanaTrip.find({ userId })
                    .sort({ createdAt: -1 });
            }
            catch (error) {
                throw new App_1.CustomError({
                    message: 'Failed to fetch user bookings',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Get all Ghana trip bookings (Admin only)
     */
    static getAllBookings() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10, status) {
            try {
                const skip = (page - 1) * limit;
                const query = {};
                if (status) {
                    query.paymentStatus = status;
                }
                const bookings = yield ghana_trip_model_1.GhanaTrip.find(query)
                    .populate('userId', 'firstName lastName email phoneNumber')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);
                const total = yield ghana_trip_model_1.GhanaTrip.countDocuments(query);
                const pages = Math.ceil(total / limit);
                return { bookings, total, pages };
            }
            catch (error) {
                throw new App_1.CustomError({
                    message: 'Failed to fetch all bookings',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    /**
     * Handle webhook payment success
     */
    static handlePaymentSuccess(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reference, id: eventId } = data;
                // Find booking by reference
                const booking = yield ghana_trip_model_1.GhanaTrip.findOne({ paymentReference: reference });
                if (!booking) {
                    console.warn('[Ghana Trip Webhook] Booking not found:', reference);
                    return;
                }
                // Update booking status
                booking.paymentStatus = 'success';
                booking.paystackResponse = data;
                booking.paidAt = new Date(data.paid_at);
                yield booking.save();
                // Update payment record
                const payment = yield payment_model_1.Payment.findOne({ reference });
                if (payment) {
                    payment.status = payment_interface_1.PaymentStatus.SUCCESS;
                    payment.paystackResponse = data;
                    payment.paidAt = new Date(data.paid_at);
                    payment.webhookProcessed = true;
                    payment.webhookEventId = eventId;
                    yield payment.save();
                }
                console.log('[Ghana Trip Webhook] Payment success processed:', { reference, eventId });
            }
            catch (error) {
                console.error('[Ghana Trip Webhook] Error processing payment success:', error);
                throw error;
            }
        });
    }
    /**
     * Handle webhook payment failure
     */
    static handlePaymentFailed(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { reference, id: eventId } = data;
                // Find booking by reference
                const booking = yield ghana_trip_model_1.GhanaTrip.findOne({ paymentReference: reference });
                if (!booking) {
                    console.warn('[Ghana Trip Webhook] Booking not found:', reference);
                    return;
                }
                // Update booking status
                booking.paymentStatus = 'failed';
                booking.paystackResponse = data;
                yield booking.save();
                // Update payment record
                const payment = yield payment_model_1.Payment.findOne({ reference });
                if (payment) {
                    payment.status = payment_interface_1.PaymentStatus.FAILED;
                    payment.paystackResponse = data;
                    payment.webhookProcessed = true;
                    payment.webhookEventId = eventId;
                    yield payment.save();
                }
                console.log('[Ghana Trip Webhook] Payment failure processed:', { reference, eventId });
            }
            catch (error) {
                console.error('[Ghana Trip Webhook] Error processing payment failure:', error);
                throw error;
            }
        });
    }
}
exports.GhanaTripService = GhanaTripService;

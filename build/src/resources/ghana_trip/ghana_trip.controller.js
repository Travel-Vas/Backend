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
exports.ghanaTripWebhookController = exports.getAllGhanaTripBookingsController = exports.getUserGhanaTripBookingsController = exports.getGhanaTripBookingAdminController = exports.getGhanaTripBookingController = exports.verifyGhanaTripPaymentController = exports.createGhanaTripBookingController = void 0;
const http_status_codes_1 = require("http-status-codes");
const ghana_trip_service_1 = require("./ghana_trip.service");
/**
 * Create Ghana trip booking and initialize payment
 */
const createGhanaTripBookingController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req['user']._id;
        const email = req['user'].email;
        const bookingData = req.body;
        const result = yield ghana_trip_service_1.GhanaTripService.createBookingAndInitializePayment(bookingData, userId, email);
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            msg: 'Ghana trip booking created and payment initialized successfully',
            data: result,
            statusCode: http_status_codes_1.StatusCodes.CREATED
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to create booking',
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.createGhanaTripBookingController = createGhanaTripBookingController;
/**
 * Verify payment for Ghana trip booking
 */
const verifyGhanaTripPaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reference } = req.params;
        const result = yield ghana_trip_service_1.GhanaTripService.verifyPayment(reference);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: 'Payment verification completed',
            data: result,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Payment verification failed',
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.verifyGhanaTripPaymentController = verifyGhanaTripPaymentController;
/**
 * Get Ghana trip booking by ID (User)
 */
const getGhanaTripBookingController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const userId = req['user']._id;
        const booking = yield ghana_trip_service_1.GhanaTripService.getBookingById(bookingId, userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: 'Booking retrieved successfully',
            data: booking,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve booking',
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getGhanaTripBookingController = getGhanaTripBookingController;
/**
 * Get Ghana trip booking by ID (Admin)
 */
const getGhanaTripBookingAdminController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const booking = yield ghana_trip_service_1.GhanaTripService.getBookingByIdAdmin(bookingId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: 'Booking retrieved successfully',
            data: booking,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve booking',
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getGhanaTripBookingAdminController = getGhanaTripBookingAdminController;
/**
 * Get all Ghana trip bookings for user
 */
const getUserGhanaTripBookingsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req['user']._id;
        const bookings = yield ghana_trip_service_1.GhanaTripService.getUserBookings(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: 'User bookings retrieved successfully',
            data: bookings,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve bookings',
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getUserGhanaTripBookingsController = getUserGhanaTripBookingsController;
/**
 * Get all Ghana trip bookings (Admin)
 */
const getAllGhanaTripBookingsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const result = yield ghana_trip_service_1.GhanaTripService.getAllBookings(page, limit, status);
        res.status(http_status_codes_1.StatusCodes.OK).json({
            msg: 'All Ghana trip bookings retrieved successfully',
            data: result,
            statusCode: http_status_codes_1.StatusCodes.OK
        });
    }
    catch (error) {
        res.status(error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve bookings',
            data: null,
            statusCode: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getAllGhanaTripBookingsController = getAllGhanaTripBookingsController;
/**
 * Webhook handler for Ghana trip payments
 * Note: This should be integrated into the main webhook handler
 * or can be used as a separate endpoint
 */
const ghanaTripWebhookController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const event = payload.event;
        // Handle different event types
        switch (event) {
            case 'charge.success':
                yield ghana_trip_service_1.GhanaTripService.handlePaymentSuccess(payload.data);
                break;
            case 'charge.failed':
                yield ghana_trip_service_1.GhanaTripService.handlePaymentFailed(payload.data);
                break;
            default:
                console.log('[Ghana Trip Webhook] Unhandled event:', event);
        }
        res.status(http_status_codes_1.StatusCodes.OK).send('OK');
    }
    catch (error) {
        console.error('[Ghana Trip Webhook] Error:', error);
        // Always return 200 to prevent Paystack from retrying
        res.status(http_status_codes_1.StatusCodes.OK).send('OK');
    }
});
exports.ghanaTripWebhookController = ghanaTripWebhookController;

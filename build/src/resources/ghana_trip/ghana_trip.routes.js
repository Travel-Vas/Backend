"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ghana_trip_controller_1 = require("./ghana_trip.controller");
const middlewares_1 = require("../../middlewares");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const ghana_trip_validation_1 = require("./ghana_trip.validation");
const router = (0, express_1.Router)();
/**
 * @route POST /api/ghana-trip/booking
 * @desc Create Ghana trip booking and initialize payment
 * @access Private
 */
router.post('/booking', middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(ghana_trip_validation_1.createGhanaTripBookingSchema), ghana_trip_controller_1.createGhanaTripBookingController);
/**
 * @route GET /api/ghana-trip/verify/:reference
 * @desc Verify payment for Ghana trip
 * @access Private
 */
router.get('/verify/:reference', middlewares_1.authenticate, ghana_trip_controller_1.verifyGhanaTripPaymentController);
/**
 * @route GET /api/ghana-trip/booking/:bookingId
 * @desc Get specific Ghana trip booking
 * @access Private
 */
router.get('/booking/:bookingId', middlewares_1.authenticate, ghana_trip_controller_1.getGhanaTripBookingController);
/**
 * @route GET /api/ghana-trip/bookings
 * @desc Get all Ghana trip bookings for user
 * @access Private
 */
router.get('/bookings', middlewares_1.authenticate, ghana_trip_controller_1.getUserGhanaTripBookingsController);
/**
 * @route GET /api/ghana-trip/admin
 * @desc Get all Ghana trip bookings (Admin only)
 * @access Private (Admin)
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 * @query status - Filter by payment status (optional)
 */
router.get('/admin', middlewares_1.authenticate, ghana_trip_controller_1.getAllGhanaTripBookingsController);
/**
 * @route GET /api/ghana-trip/admin/:bookingId
 * @desc Get single Ghana trip booking details (Admin only)
 * @access Private (Admin)
 */
router.get('/admin/:bookingId', middlewares_1.authenticate, ghana_trip_controller_1.getGhanaTripBookingAdminController);
/**
 * @route POST /api/ghana-trip/webhook
 * @desc Webhook endpoint for Ghana trip payments
 * @access Public (secured with Paystack signature)
 */
router.post('/webhook', ghana_trip_controller_1.ghanaTripWebhookController);
exports.default = {
    path: '/ghana-trip',
    router: router
};

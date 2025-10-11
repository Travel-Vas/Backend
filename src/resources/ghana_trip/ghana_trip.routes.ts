import { Router } from 'express';
import {
    createGhanaTripBookingController,
    verifyGhanaTripPaymentController,
    getGhanaTripBookingController,
    getGhanaTripBookingAdminController,
    getUserGhanaTripBookingsController,
    getAllGhanaTripBookingsController,
    ghanaTripWebhookController
} from './ghana_trip.controller';
import { authenticate } from '../../middlewares';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
    createGhanaTripBookingSchema,
    verifyGhanaTripPaymentSchema,
    getGhanaTripBookingSchema
} from './ghana_trip.validation';

const router = Router();

/**
 * @route POST /api/ghana-trip/booking
 * @desc Create Ghana trip booking and initialize payment
 * @access Private
 */
router.post(
    '/booking',
    authenticate,
    validationMiddleware(createGhanaTripBookingSchema),
    createGhanaTripBookingController
);

/**
 * @route GET /api/ghana-trip/verify/:reference
 * @desc Verify payment for Ghana trip
 * @access Private
 */
router.get(
    '/verify/:reference',
    authenticate,
    verifyGhanaTripPaymentController
);

/**
 * @route GET /api/ghana-trip/booking/:bookingId
 * @desc Get specific Ghana trip booking
 * @access Private
 */
router.get(
    '/booking/:bookingId',
    authenticate,
    getGhanaTripBookingController
);

/**
 * @route GET /api/ghana-trip/bookings
 * @desc Get all Ghana trip bookings for user
 * @access Private
 */
router.get(
    '/bookings',
    authenticate,
    getUserGhanaTripBookingsController
);

/**
 * @route GET /api/ghana-trip/admin
 * @desc Get all Ghana trip bookings (Admin only)
 * @access Private (Admin)
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 * @query status - Filter by payment status (optional)
 */
router.get(
    '/admin',
    authenticate,
    getAllGhanaTripBookingsController
);

/**
 * @route GET /api/ghana-trip/admin/:bookingId
 * @desc Get single Ghana trip booking details (Admin only)
 * @access Private (Admin)
 */
router.get(
    '/admin/:bookingId',
    authenticate,
    getGhanaTripBookingAdminController
);

/**
 * @route POST /api/ghana-trip/webhook
 * @desc Webhook endpoint for Ghana trip payments
 * @access Public (secured with Paystack signature)
 */
router.post(
    '/webhook',
    ghanaTripWebhookController
);

export default {
    path: '/ghana-trip',
    router: router
};

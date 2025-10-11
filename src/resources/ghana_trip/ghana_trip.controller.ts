import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GhanaTripService } from './ghana_trip.service';
import { CustomResponse } from '../../helpers/lib/App';
import { IGhanaTripBooking } from './ghana_trip.interface';

/**
 * Create Ghana trip booking and initialize payment
 */
export const createGhanaTripBookingController = async (
    req: Request,
    res: CustomResponse<any>
) => {
    try {
        const userId = req['user']._id;
        const email = req['user'].email;
        const bookingData: IGhanaTripBooking = req.body;

        const result = await GhanaTripService.createBookingAndInitializePayment(
            bookingData,
            userId,
            email
        );

        res.status(StatusCodes.CREATED).json({
            msg: 'Ghana trip booking created and payment initialized successfully',
            data: result,
            statusCode: StatusCodes.CREATED
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to create booking',
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Verify payment for Ghana trip booking
 */
export const verifyGhanaTripPaymentController = async (
    req: Request,
    res: CustomResponse<any>
) => {
    try {
        const { reference } = req.params;

        const result = await GhanaTripService.verifyPayment(reference);

        res.status(StatusCodes.OK).json({
            msg: 'Payment verification completed',
            data: result,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Payment verification failed',
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Get Ghana trip booking by ID (User)
 */
export const getGhanaTripBookingController = async (
    req: Request,
    res: CustomResponse<any>
) => {
    try {
        const { bookingId } = req.params;
        const userId = req['user']._id;

        const booking = await GhanaTripService.getBookingById(bookingId, userId);

        res.status(StatusCodes.OK).json({
            msg: 'Booking retrieved successfully',
            data: booking,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve booking',
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Get Ghana trip booking by ID (Admin)
 */
export const getGhanaTripBookingAdminController = async (
    req: Request,
    res: CustomResponse<any>
) => {
    try {
        const { bookingId } = req.params;

        const booking = await GhanaTripService.getBookingByIdAdmin(bookingId);

        res.status(StatusCodes.OK).json({
            msg: 'Booking retrieved successfully',
            data: booking,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve booking',
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Get all Ghana trip bookings for user
 */
export const getUserGhanaTripBookingsController = async (
    req: Request,
    res: CustomResponse<any>
) => {
    try {
        const userId = req['user']._id;

        const bookings = await GhanaTripService.getUserBookings(userId);

        res.status(StatusCodes.OK).json({
            msg: 'User bookings retrieved successfully',
            data: bookings,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve bookings',
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Get all Ghana trip bookings (Admin)
 */
export const getAllGhanaTripBookingsController = async (
    req: Request,
    res: CustomResponse<any>
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;

        const result = await GhanaTripService.getAllBookings(page, limit, status);

        res.status(StatusCodes.OK).json({
            msg: 'All Ghana trip bookings retrieved successfully',
            data: result,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || 'Failed to retrieve bookings',
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

/**
 * Webhook handler for Ghana trip payments
 * Note: This should be integrated into the main webhook handler
 * or can be used as a separate endpoint
 */
export const ghanaTripWebhookController = async (
    req: Request,
    res: Response
) => {
    try {
        const payload = req.body;
        const event = payload.event;

        // Handle different event types
        switch (event) {
            case 'charge.success':
                await GhanaTripService.handlePaymentSuccess(payload.data);
                break;

            case 'charge.failed':
                await GhanaTripService.handlePaymentFailed(payload.data);
                break;

            default:
                console.log('[Ghana Trip Webhook] Unhandled event:', event);
        }

        res.status(StatusCodes.OK).send('OK');
    } catch (error: any) {
        console.error('[Ghana Trip Webhook] Error:', error);
        // Always return 200 to prevent Paystack from retrying
        res.status(StatusCodes.OK).send('OK');
    }
};

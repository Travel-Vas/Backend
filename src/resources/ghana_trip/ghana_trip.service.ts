import { paystack } from '../../utils/paystack';
import { GhanaTrip, IGhanaTripDocument } from './ghana_trip.model';
import { IGhanaTripBooking } from './ghana_trip.interface';
import { Payment } from '../booking/payment.model';
import { PaymentStatus, PaymentType } from '../booking/payment.interface';
import { CustomError } from '../../helpers/lib/App';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

export class GhanaTripService {

    /**
     * Create Ghana trip booking and initialize payment
     */
    static async createBookingAndInitializePayment(
        bookingData: IGhanaTripBooking,
        userId: string,
        email: string
    ): Promise<any> {
        try {
            // Validate user ID and email
            if (!userId) {
                throw new CustomError({
                    message: 'User ID is required',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            if (!email) {
                throw new CustomError({
                    message: 'Email is required',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            // Set user ID and email
            bookingData.userId = userId;
            bookingData.email = email;

            // Generate payment reference
            const reference = `ghana_trip_${uuidv4()}`;
            bookingData.paymentReference = reference;
            bookingData.paymentStatus = 'pending';

            // Create Ghana trip booking record
            const ghanaTrip = await GhanaTrip.create(bookingData);

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
                    bookingId: (ghanaTrip._id as any).toString(),
                    userId,
                    flowType: bookingData.bookingData.flowType,
                    transportType: bookingData.bookingData.transport.type,
                    toursCount: bookingData.bookingData.selectedTours.length,
                    hasConferenceHotel: !!bookingData.bookingData.conferenceHotel,
                    roomSharing: bookingData.bookingData.roomSharing,
                    intraCityLogistics: bookingData.bookingData.intraCityLogistics
                }
            };

            const paystackResponse = await paystack.transaction.initialize(paymentData);

            if (!paystackResponse || !paystackResponse.status) {
                throw new CustomError({
                    message: 'Failed to initialize payment with Paystack',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            // Save payment record in Payment collection
            await Payment.create({
                tripId: ghanaTrip._id as any,
                userId,
                reference,
                amount: bookingData.pricing.total,
                paymentType: PaymentType.FULL,
                status: PaymentStatus.PENDING,
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

        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: error.message || 'Failed to create booking and initialize payment',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Verify payment and update booking status
     */
    static async verifyPayment(reference: string): Promise<any> {
        try {
            // Verify with Paystack
            const paystackResponse = await paystack.transaction.verify(reference);

            if (!paystackResponse || !paystackResponse.status) {
                throw new CustomError({
                    message: 'Payment verification failed',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            // Find booking by reference
            const booking = await GhanaTrip.findOne({ paymentReference: reference });
            if (!booking) {
                throw new CustomError({
                    message: 'Booking not found',
                    code: StatusCodes.NOT_FOUND
                });
            }

            // Update booking status
            const isSuccess = paystackResponse.data.status === 'success';
            booking.paymentStatus = isSuccess ? 'success' : 'failed';
            booking.paystackResponse = paystackResponse.data;
            if (isSuccess) {
                booking.paidAt = new Date(paystackResponse.data.paid_at);
            }
            await booking.save();

            // Update payment record
            const payment = await Payment.findOne({ reference });
            if (payment) {
                payment.status = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
                payment.paystackResponse = paystackResponse.data;
                if (isSuccess) {
                    payment.paidAt = new Date(paystackResponse.data.paid_at);
                }
                await payment.save();
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

        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: error.message || 'Payment verification failed',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Get booking by ID (User - own bookings only)
     */
    static async getBookingById(bookingId: string, userId: string): Promise<IGhanaTripDocument> {
        try {
            const booking = await GhanaTrip.findOne({ _id: bookingId, userId })
                .populate('userId', 'firstName lastName email phoneNumber');

            if (!booking) {
                throw new CustomError({
                    message: 'Booking not found',
                    code: StatusCodes.NOT_FOUND
                });
            }

            return booking;
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: 'Failed to fetch booking',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Get booking by ID (Admin - any booking)
     */
    static async getBookingByIdAdmin(bookingId: string): Promise<IGhanaTripDocument> {
        try {
            const booking = await GhanaTrip.findById(bookingId)
                .populate('userId', 'firstName lastName email phoneNumber');

            if (!booking) {
                throw new CustomError({
                    message: 'Booking not found',
                    code: StatusCodes.NOT_FOUND
                });
            }

            return booking;
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: 'Failed to fetch booking',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Get all bookings for a user
     */
    static async getUserBookings(userId: string): Promise<IGhanaTripDocument[]> {
        try {
            return await GhanaTrip.find({ userId })
                .sort({ createdAt: -1 });
        } catch (error: any) {
            throw new CustomError({
                message: 'Failed to fetch user bookings',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Get all Ghana trip bookings (Admin only)
     */
    static async getAllBookings(
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<{ bookings: IGhanaTripDocument[], total: number, pages: number }> {
        try {
            const skip = (page - 1) * limit;
            const query: any = {};

            if (status) {
                query.paymentStatus = status;
            }

            const bookings = await GhanaTrip.find(query)
                .populate('userId', 'firstName lastName email phoneNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await GhanaTrip.countDocuments(query);
            const pages = Math.ceil(total / limit);

            return { bookings, total, pages };
        } catch (error: any) {
            throw new CustomError({
                message: 'Failed to fetch all bookings',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Handle webhook payment success
     */
    static async handlePaymentSuccess(data: any): Promise<void> {
        try {
            const { reference, id: eventId } = data;

            // Find booking by reference
            const booking = await GhanaTrip.findOne({ paymentReference: reference });
            if (!booking) {
                console.warn('[Ghana Trip Webhook] Booking not found:', reference);
                return;
            }

            // Update booking status
            booking.paymentStatus = 'success';
            booking.paystackResponse = data;
            booking.paidAt = new Date(data.paid_at);
            await booking.save();

            // Update payment record
            const payment: any = await Payment.findOne({ reference });
            if (payment) {
                payment.status = PaymentStatus.SUCCESS;
                payment.paystackResponse = data;
                payment.paidAt = new Date(data.paid_at);
                payment.webhookProcessed = true;
                payment.webhookEventId = eventId;
                await payment.save();
            }

            console.log('[Ghana Trip Webhook] Payment success processed:', { reference, eventId });
        } catch (error: any) {
            console.error('[Ghana Trip Webhook] Error processing payment success:', error);
            throw error;
        }
    }

    /**
     * Handle webhook payment failure
     */
    static async handlePaymentFailed(data: any): Promise<void> {
        try {
            const { reference, id: eventId } = data;

            // Find booking by reference
            const booking = await GhanaTrip.findOne({ paymentReference: reference });
            if (!booking) {
                console.warn('[Ghana Trip Webhook] Booking not found:', reference);
                return;
            }

            // Update booking status
            booking.paymentStatus = 'failed';
            booking.paystackResponse = data;
            await booking.save();

            // Update payment record
            const payment: any = await Payment.findOne({ reference });
            if (payment) {
                payment.status = PaymentStatus.FAILED;
                payment.paystackResponse = data;
                payment.webhookProcessed = true;
                payment.webhookEventId = eventId;
                await payment.save();
            }

            console.log('[Ghana Trip Webhook] Payment failure processed:', { reference, eventId });
        } catch (error: any) {
            console.error('[Ghana Trip Webhook] Error processing payment failure:', error);
            throw error;
        }
    }
}

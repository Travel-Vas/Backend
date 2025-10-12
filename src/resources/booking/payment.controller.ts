import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PaymentService } from './payment.service';
import { CustomResponse } from '../../helpers/lib/App';
import { IInstallmentPayment } from './payment.interface';
import { Trip } from './booking.model';
import crypto from 'crypto';

export const initializeFullPaymentController = async (req: Request, res: CustomResponse<any>) => {
        const { tripId, email } = req.body;
        const userId = req['user']._id;
        const paymentResponse = await PaymentService.initializeFullPayment(tripId, userId, email);

        res.status(StatusCodes.OK).json({
            msg: "Payment initialized successfully",
            data: {
                authorization_url: paymentResponse.data.authorization_url,
                access_code: paymentResponse.data.access_code,
                reference: paymentResponse.data.reference
            },
            statusCode: StatusCodes.OK
        });
};

export const initializeInstallmentPaymentController = async (req: Request, res: CustomResponse<any>) => {
    try {
        const { tripId, email, installmentCount, frequency } = req.body;
        const userId = req['user']._id;

        // Get trip cost to calculate installments
        const tripData = await Trip.findById(tripId);
        if (!tripData) {
            return res.status(StatusCodes.NOT_FOUND).json({
                msg: "Trip not found",
                data: null,
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const totalAmount = parseFloat(tripData.tripCost);

        const installmentData: IInstallmentPayment = {
            tripId,
            userId,
            totalAmount,
            installmentCount,
            installmentAmount: Math.ceil(totalAmount / installmentCount),
            frequency: frequency || 'monthly',
            email
        };

        const paymentResponse = await PaymentService.initializeInstallmentPayment(installmentData);

        res.status(StatusCodes.OK).json({
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
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to initialize installment payment",
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const verifyPaymentController = async (req: Request, res: CustomResponse<any>) => {
    try {
        const { reference } = req.params;

        const verificationResponse = await PaymentService.verifyPayment(reference);

        res.status(StatusCodes.OK).json({
            msg: "Payment verification completed",
            data: {
                status: verificationResponse.data.status,
                reference: verificationResponse.data.reference,
                amount: verificationResponse.data.amount / 100, // Convert back to Naira
                paidAt: verificationResponse.data.paid_at,
                channel: verificationResponse.data.channel,
                customer: verificationResponse.data.customer
            },
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Payment verification failed",
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const getPaymentHistoryController = async (req: Request, res: CustomResponse<any>) => {
    try {
        const { tripId } = req.params;
        const userId = req['user']._id;

        const paymentHistory = await PaymentService.getPaymentHistory(tripId, userId);

        res.status(StatusCodes.OK).json({
            msg: "Payment history retrieved successfully",
            data: paymentHistory,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to get payment history",
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const getPendingInstallmentsController = async (req: Request, res: CustomResponse<any>) => {
    try {
        const userId = req['user']._id;

        const pendingInstallments = await PaymentService.getPendingInstallments(userId);

        res.status(StatusCodes.OK).json({
            msg: "Pending installments retrieved successfully",
            data: pendingInstallments,
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to get pending installments",
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const processNextInstallmentController = async (req: Request, res: CustomResponse<any>) => {
    try {
        const { paymentId, email } = req.body;

        const paymentResponse = await PaymentService.processNextInstallment(paymentId, email);

        res.status(StatusCodes.OK).json({
            msg: "Next installment initialized successfully",
            data: {
                authorization_url: paymentResponse.data.authorization_url,
                access_code: paymentResponse.data.access_code,
                reference: paymentResponse.data.reference
            },
            statusCode: StatusCodes.OK
        });
    } catch (error: any) {
        res.status(error.code || StatusCodes.INTERNAL_SERVER_ERROR).json({
            msg: error.message || "Failed to process next installment",
            data: null,
            statusCode: error.code || StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const paystackWebhookController = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const payload = req.body;
        const signature = req.headers['x-paystack-signature'] as string;

        // Verify webhook signature
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            console.error('[Webhook] PAYSTACK_SECRET_KEY not configured');
            return res.status(StatusCodes.OK).send('OK');
        }

        const hash = crypto
            .createHmac('sha512', secretKey)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (hash !== signature) {
            console.error('[Webhook] Invalid signature', {
                event: payload.event,
                receivedSignature: signature?.substring(0, 10) + '...'
            });
            return res.status(StatusCodes.OK).send('OK');
        }

        // Check if this is a Ghana trip payment by reference prefix
        const isGhanaTrip = payload.data?.reference?.startsWith('ghana_trip_');

        console.log('[Webhook] Event received:', {
            event: payload.event,
            eventId: payload.data?.id,
            reference: payload.data?.reference,
            handler: isGhanaTrip ? 'GhanaTripService' : 'PaymentService'
        });

        switch (payload.event) {
            case 'charge.success':
                if (isGhanaTrip) {
                    // Import GhanaTripService dynamically to avoid circular dependencies
                    const { GhanaTripService } = await import('../ghana_trip/ghana_trip.service');
                    await GhanaTripService.handlePaymentSuccess(payload.data);
                } else {
                    await PaymentService.handleChargeSuccess(payload.data);
                }
                break;

            case 'charge.failed':
                if (isGhanaTrip) {
                    const { GhanaTripService } = await import('../ghana_trip/ghana_trip.service');
                    await GhanaTripService.handlePaymentFailed(payload.data);
                } else {
                    await PaymentService.handleChargeFailed(payload.data);
                }
                break;

            case 'transfer.success':
                await PaymentService.handleTransferSuccess(payload.data);
                break;

            case 'transfer.failed':
            case 'transfer.reversed':
                await PaymentService.handleTransferFailed(payload.data);
                break;

            case 'refund.pending':
            case 'refund.processed':
            case 'refund.failed':
                await PaymentService.handleRefund(payload.event, payload.data);
                break;

            default:
                console.log('[Webhook] Unhandled event type:', payload.event);
        }

        const duration = Date.now() - startTime;
        console.log('[Webhook] Processed successfully', {
            event: payload.event,
            duration: `${duration}ms`
        });

        res.status(StatusCodes.OK).send('OK');
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error('[Webhook] Error:', {
            error: error.message,
            stack: error.stack,
            duration: `${duration}ms`
        });
        // Always respond with 200 to prevent Paystack from retrying
        res.status(StatusCodes.OK).send('OK');
    }
};
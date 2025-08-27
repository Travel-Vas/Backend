import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PaymentService } from './payment.service';
import { CustomResponse } from '../../helpers/lib/App';
import { IInstallmentPayment } from './payment.interface';
import { Trip } from './booking.model';

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
    try {
        const payload = req.body;
        
        // Verify webhook signature (implement based on Paystack documentation)
        const signature = req.headers['x-paystack-signature'];
        
        if (payload.event === 'charge.success') {
            const reference = payload.data.reference;
            await PaymentService.verifyPayment(reference);
        }

        res.status(StatusCodes.OK).send('OK');
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(StatusCodes.OK).send('OK'); // Always respond with 200 to Paystack
    }
};
import { paystack } from '../../utils/paystack';
import { Payment, IPaymentDocument } from './payment.model';
import { Trip } from './booking.model';
import { 
    IPaymentInitialize, 
    IPaymentResponse, 
    IPaymentVerification, 
    IInstallmentPayment,
    PaymentStatus,
    PaymentType 
} from './payment.interface';
import { CustomError } from '../../helpers/lib/App';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
    
    /**
     * Initialize full payment for a trip
     */
    static async initializeFullPayment(tripId: any, userId: string, email: string): Promise<any> {
        try {
            const trip = await Trip.findOne({
                _id:tripId
            }).lean().exec();
            if (!trip) {
                throw new CustomError({
                    message: 'Trip not found',
                    code: StatusCodes.NOT_FOUND
                });
            }
            const amount = Number(trip.tripCost) * 100 // Convert to kobo
            const reference = `trip_full_${tripId}_${uuidv4()}`;

            // Initialize payment with Paystack
            const paymentData: IPaymentInitialize = {
                email,
                amount,
                name: `${trip.name} - Full Payment`,
                reference,
                currency: 'NGN',
                callback_url: `${process.env.APP_URL}/dashboard/download`,
                metadata: {
                    tripId,
                    userId,
                    paymentType: PaymentType.FULL,
                    tripName: trip.name,
                    destination: trip.destination
                }
            }

            const response = await paystack.transaction.initialize(paymentData);
            if (!response) {
                throw new CustomError({
                    message: 'Failed to initialize payment',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            // Save payment record
            await Payment.create({
                tripId,
                userId,
                reference,
                amount: amount / 100, // Store in Naira
                paymentType: PaymentType.FULL,
                status: PaymentStatus.PENDING,
                metadata: paymentData.metadata
            });

            return response;
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: error.message || 'Failed to initialize payment',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Initialize installment payment plan for a trip
     */
    static async initializeInstallmentPayment(installmentData: IInstallmentPayment): Promise<any> {
        try {
            const { tripId, userId, totalAmount, installmentCount, email } = installmentData;

            const trip = await Trip.findById(tripId);
            if (!trip) {
                throw new CustomError({
                    message: 'Trip not found',
                    code: StatusCodes.NOT_FOUND
                });
            }

            const installmentAmount = Math.ceil(totalAmount / installmentCount);
            const firstInstallmentAmount = installmentAmount * 100; // Convert to kobo
            const reference = `trip_install_1_${tripId}_${uuidv4()}`;

            // Initialize first installment payment
            const paymentData: IPaymentInitialize = {
                email,
                amount: firstInstallmentAmount,
                name: `${trip.name} - Installment 1 of ${installmentCount}`,
                reference,
                currency: 'NGN',
                metadata: {
                    tripId,
                    userId,
                    paymentType: PaymentType.INSTALLMENT,
                    installmentNumber: 1,
                    totalInstallments: installmentCount,
                    totalAmount,
                    installmentAmount,
                    tripName: trip.name,
                    destination: trip.destination
                }
            };

            const response = await paystack.transaction.initialize(paymentData);

            if (!response.status) {
                throw new CustomError({
                    message: 'Failed to initialize installment payment',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            // Calculate next payment date (30 days from now for monthly)
            const nextPaymentDate = new Date();
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

            // Save payment record
            await Payment.create({
                tripId,
                userId,
                reference,
                amount: installmentAmount,
                totalAmount,
                installmentNumber: 1,
                totalInstallments: installmentCount,
                paymentType: PaymentType.INSTALLMENT,
                status: PaymentStatus.PENDING,
                nextPaymentDate: installmentCount > 1 ? nextPaymentDate : undefined,
                metadata: paymentData.metadata
            });

            return response;
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: error.message || 'Failed to initialize installment payment',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Verify payment with Paystack
     */
    static async verifyPayment(reference: string): Promise<any> {
        try {
            const response = await paystack.transaction.verify(reference);

            if (!response.status) {
                throw new CustomError({
                    message: 'Payment verification failed',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            // Update payment record
            const payment:any = await Payment.findOne({ reference });
            const tripDetails  = await Trip.findById(payment.userId)
            if (payment) {
                payment.status = response.data.status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
                payment.paystackResponse = response.data;
                if (response.data.status === 'success') {
                    payment.paidAt = new Date(response.data.paid_at);
                    await Trip.findOneAndUpdate({
                        userId: payment.userId,
                    }, {
                        status: PaymentStatus.SUCCESS,
                    }, {
                        new: true
                    })
                }
                await payment.save();

                // If this is a successful installment payment, create next installment record
                if (payment.paymentType === PaymentType.INSTALLMENT && 
                    payment.status === PaymentStatus.SUCCESS &&
                    payment.installmentNumber! < payment.totalInstallments!) {
                    
                    await this.createNextInstallmentRecord(payment);
                }
            }

            return response;
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: error.message || 'Payment verification failed',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Create next installment payment record
     */
    private static async createNextInstallmentRecord(currentPayment: IPaymentDocument): Promise<void> {
        const nextInstallmentNumber = currentPayment.installmentNumber! + 1;
        const nextReference = `trip_install_${nextInstallmentNumber}_${currentPayment.tripId}_${uuidv4()}`;
        
        // Calculate next payment date (30 days from current payment)
        const nextPaymentDate = new Date(currentPayment.paidAt!);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

        await Payment.create({
            tripId: currentPayment.tripId,
            userId: currentPayment.userId,
            reference: nextReference,
            amount: currentPayment.amount,
            totalAmount: currentPayment.totalAmount,
            installmentNumber: nextInstallmentNumber,
            totalInstallments: currentPayment.totalInstallments,
            paymentType: PaymentType.INSTALLMENT,
            status: PaymentStatus.PENDING,
            nextPaymentDate: nextInstallmentNumber < currentPayment.totalInstallments! ? 
                            new Date(nextPaymentDate.getTime() + (30 * 24 * 60 * 60 * 1000)) : undefined,
            metadata: currentPayment.metadata
        });
    }

    /**
     * Get payment history for a trip
     */
    static async getPaymentHistory(tripId: string, userId: string): Promise<IPaymentDocument[]> {
        try {
            return await Payment.find({ tripId, userId })
                .sort({ createdAt: -1 })
                .populate('tripId', 'name destination tripCost');
        } catch (error: any) {
            throw new CustomError({
                message: 'Failed to fetch payment history',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Get pending installments for a user
     */
    static async getPendingInstallments(userId: string): Promise<IPaymentDocument[]> {
        try {
            const today = new Date();
            return await Payment.find({
                userId,
                paymentType: PaymentType.INSTALLMENT,
                status: PaymentStatus.PENDING,
                nextPaymentDate: { $lte: today }
            }).populate('tripId', 'name destination tripCost');
        } catch (error: any) {
            throw new CustomError({
                message: 'Failed to fetch pending installments',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }

    /**
     * Process next installment payment
     */
    static async processNextInstallment(paymentId: string, email: string): Promise<any> {
        try {
            const payment = await Payment.findById(paymentId).populate('tripId');
            if (!payment) {
                throw new CustomError({
                    message: 'Payment record not found',
                    code: StatusCodes.NOT_FOUND
                });
            }

            if (payment.status !== PaymentStatus.PENDING) {
                throw new CustomError({
                    message: 'Payment is not pending',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            const amount = payment.amount * 100; // Convert to kobo
            const trip = payment.tripId as any;

            const paymentData: IPaymentInitialize = {
                email,
                amount,
                name: `${trip.name} - Installment ${payment.installmentNumber} of ${payment.totalInstallments}`,
                reference: payment.reference,
                currency: 'NGN',
                metadata: payment.metadata
            };

            const response = await paystack.transaction.initialize(paymentData);

            if (!response.status) {
                throw new CustomError({
                    message: 'Failed to initialize installment payment',
                    code: StatusCodes.BAD_REQUEST
                });
            }

            return response;
        } catch (error: any) {
            if (error instanceof CustomError) throw error;
            throw new CustomError({
                message: error.message || 'Failed to process installment payment',
                code: StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }
}
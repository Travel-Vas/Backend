import stripe from "./stripe";
import {CustomError} from "../helpers/lib/App";
import {StatusCodes} from "http-status-codes";

export const createPaymentIntent = async (payload: {
    amount: number,
    userId: string,
    storageSize: string,
    transactionId: string
}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.floor(payload.amount * 100), // amount in cents
            currency: 'usd',
            payment_method: 'card',
            payment_method_types: [
                'card',
                'us_bank_account', // ACH direct bank transfer
                'cashapp',         // Cash App
                'apple_pay',        // Apple Pay
                'google_pay'        // Google Pay
            ],
            metadata: {
                userId: payload.userId.toString(),
                storageSize: payload.storageSize,
                transactionId: payload.transactionId.toString(),
            },
            // Optional: Configure additional payment intent options
            setup_future_usage: 'off_session', // Allow saving payment method for future use

            // Optional: Add specific configurations
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' // Prevent redirects for a smoother payment flow
            }
        });

        return paymentIntent;
    } catch (error) {
        // Handle any Stripe-specific errors
        console.error('Payment Intent Creation Error:', error);
        throw new CustomError({
            message: 'Failed to create payment intent',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export function parseStorageSizeWithUnit(storageString: string): {
    size: number,
    unit: 'GB' | 'TB' | 'MB'
} {
    const match = storageString.match(/^(\d+)\s*(GB|TB|MB)?$/i);

    if (!match) {
        throw new Error('Invalid storage format');
    }

    return {
        size: parseInt(match[1], 10),
        unit: (match[2]?.toUpperCase() || 'GB') as 'GB' | 'TB' | 'MB'
    };
}
import { Router } from 'express';
import {
    initializeFullPaymentController,
    initializeInstallmentPaymentController,
    verifyPaymentController,
    getPaymentHistoryController,
    getPendingInstallmentsController,
    processNextInstallmentController,
    paystackWebhookController
} from './payment.controller';
import { authenticate } from '../../middlewares';
import { validationMiddleware } from '../../middlewares/validation.middleware';
import {
    initializeFullPaymentSchema,
    initializeInstallmentPaymentSchema,
    verifyPaymentSchema,
    processInstallmentSchema
} from './payment.validation';

const router = Router();

/**
 * @route POST /api/payments/initialize-full
 * @desc Initialize full payment for a trip
 * @access Private
 */
router.post(
    '/initialize-full',
    authenticate,
    validationMiddleware(initializeFullPaymentSchema),
    initializeFullPaymentController
);

/**
 * @route POST /api/payments/initialize-installment
 * @desc Initialize installment payment plan for a trip
 * @access Private
 */
router.post(
    '/initialize-installment',
    authenticate,
    validationMiddleware(initializeInstallmentPaymentSchema),
    initializeInstallmentPaymentController
);

/**
 * @route GET /api/payments/verify/:reference
 * @desc Verify payment with Paystack
 * @access Private
 */
router.get(
    '/verify/:reference',
    authenticate,
    verifyPaymentController
);

/**
 * @route GET /api/payments/history/:tripId
 * @desc Get payment history for a specific trip
 * @access Private
 */
router.get(
    '/history/:tripId',
    authenticate,
    getPaymentHistoryController
);

/**
 * @route GET /api/payments/pending-installments
 * @desc Get pending installment payments for user
 * @access Private
 */
router.get(
    '/pending-installments',
    authenticate,
    getPendingInstallmentsController
);

/**
 * @route POST /api/payments/process-installment
 * @desc Process next installment payment
 * @access Private
 */
router.post(
    '/process-installment',
    authenticate,
    validationMiddleware(processInstallmentSchema),
    processNextInstallmentController
);

/**
 * @route POST /api/payments/webhook
 * @desc Paystack webhook endpoint
 * @access Public (but should be secured with signature verification)
 */
router.post('/webhook', paystackWebhookController);

export default {
    path: "/payments",
    router: router
};
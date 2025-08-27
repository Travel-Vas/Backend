"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const middlewares_1 = require("../../middlewares");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const payment_validation_1 = require("./payment.validation");
const router = (0, express_1.Router)();
/**
 * @route POST /api/payments/initialize-full
 * @desc Initialize full payment for a trip
 * @access Private
 */
router.post('/initialize-full', middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(payment_validation_1.initializeFullPaymentSchema), payment_controller_1.initializeFullPaymentController);
/**
 * @route POST /api/payments/initialize-installment
 * @desc Initialize installment payment plan for a trip
 * @access Private
 */
router.post('/initialize-installment', middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(payment_validation_1.initializeInstallmentPaymentSchema), payment_controller_1.initializeInstallmentPaymentController);
/**
 * @route GET /api/payments/verify/:reference
 * @desc Verify payment with Paystack
 * @access Private
 */
router.get('/verify/:reference', middlewares_1.authenticate, payment_controller_1.verifyPaymentController);
/**
 * @route GET /api/payments/history/:tripId
 * @desc Get payment history for a specific trip
 * @access Private
 */
router.get('/history/:tripId', middlewares_1.authenticate, payment_controller_1.getPaymentHistoryController);
/**
 * @route GET /api/payments/pending-installments
 * @desc Get pending installment payments for user
 * @access Private
 */
router.get('/pending-installments', middlewares_1.authenticate, payment_controller_1.getPendingInstallmentsController);
/**
 * @route POST /api/payments/process-installment
 * @desc Process next installment payment
 * @access Private
 */
router.post('/process-installment', middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(payment_validation_1.processInstallmentSchema), payment_controller_1.processNextInstallmentController);
/**
 * @route POST /api/payments/webhook
 * @desc Paystack webhook endpoint
 * @access Public (but should be secured with signature verification)
 */
router.post('/webhook', payment_controller_1.paystackWebhookController);
exports.default = {
    path: "/payments",
    router: router
};

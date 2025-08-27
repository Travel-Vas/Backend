"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystackWebhook = exports.transactionHistory = exports.clientExtraPhotosPayment = exports.stripWebhook = exports.initPayment = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const transaction_service_1 = require("./transaction.service");
const stripe_1 = __importDefault(require("../../utils/stripe"));
const crypto_1 = __importDefault(require("crypto"));
const secretKey = process.env.PAYSTACK_SECRET_KEY;
if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined in environment variables.");
}
const initPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        clientId: req.body.clientId,
        email: req.body.email,
        packageType: req.body.packageType,
        noOfPhotos: req.body.noOfPhotos,
        reason: req.body.reason,
        amount: req.body.amount,
        shootId: req.body.shootId,
        paymentMethods: req.body.paymentMethods,
    };
    const response = yield (0, transaction_service_1.initPaymentService)(payload);
    res.json({
        msg: "Payment initialised successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.initPayment = initPayment;
const stripWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers['stripe-signature'];
    console.log("Webhook received from strip service");
    // console.log(req.body)
    // Verify webhook signature
    const event = stripe_1.default.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    yield (0, transaction_service_1.stripWebhookService)(event);
    res.status(200).send({ received: true });
});
exports.stripWebhook = stripWebhook;
const clientExtraPhotosPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = {
        userId: (_a = req['user']) === null || _a === void 0 ? void 0 : _a._id,
        accessKey: req.body.accessKey,
        clientId: req.body.clientId,
        email: req.body.email,
        packageType: req.body.packageType,
        noOfPhotos: req.body.noOfPhotos,
        reason: req.body.reason,
        amount: req.body.amount,
        shootId: req.body.shootId,
        paymentMethods: req.body.paymentMethods,
    };
    const response = yield (0, transaction_service_1.ExtraPaymentService)(payload);
    res.json({
        msg: "Payment initialised successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.clientExtraPhotosPayment = clientExtraPhotosPayment;
const transactionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, transaction_service_1.transactionHistoryService)(userId);
    res.json({
        msg: "Data retrieved",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.transactionHistory = transactionHistory;
const paystackWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        // req.body is a Buffer because of express.raw()
        const hash = crypto_1.default
            .createHmac('sha512', secretKey)
            .update(req.body)
            .digest('hex');
        const signature = req.headers['x-paystack-signature'];
        if (hash !== signature) {
            console.log("Invalid signature");
            return res.status(401).send("Invalid signature");
        }
        // Convert the Buffer to a string before parsing it
        const rawData = req.body.toString();
        // Now parse the string to JSON
        const jsonData = JSON.parse(rawData);
        // console.log("Parsed webhook data:", jsonData);
        console.log("Webhook received from Paystack service");
        const event = jsonData.event;
        const data = jsonData.data;
        yield (0, transaction_service_1.paystackWebhookService)(event, data);
        return res.status(200).send({ received: true });
    }
    catch (error) {
        console.error("Error processing Paystack webhook:", error);
        // Log more details for debugging
        if (req.body) {
            console.error("Webhook body type:", typeof req.body);
            if (req.body instanceof Buffer) {
                console.error("Webhook body (first 200 chars):", req.body.toString().substring(0, 200));
            }
        }
        return res.status(500).send("Internal server error");
    }
});
exports.paystackWebhook = paystackWebhook;

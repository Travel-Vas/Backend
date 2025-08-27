"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("../collection/validation");
const validation_2 = require("./validation");
const middlewares_1 = require("../../middlewares");
const transaction_controller_1 = require("./transaction.controller");
const router = express_1.default.Router();
router.post('/initialise', middlewares_1.authenticate, (0, validation_1.validate)(validation_2.ClientSchema), transaction_controller_1.initPayment);
router.post('/extra-photos', middlewares_1.authenticate, (0, validation_1.validate)(validation_2.ClientExtraPhotoSchema), transaction_controller_1.clientExtraPhotosPayment);
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), transaction_controller_1.stripWebhook);
router.get('/history', middlewares_1.authenticate, transaction_controller_1.transactionHistory);
exports.default = {
    path: "/transactions",
    router: router,
};

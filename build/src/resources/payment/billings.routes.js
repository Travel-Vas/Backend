"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../middlewares");
const payment_controller_1 = require("./payment.controller");
const validation_1 = require("../collection/validation");
const billing_validation_1 = require("./billing.validation");
const router = express_1.default.Router();
router.post('/create', middlewares_1.authenticate, (0, validation_1.validate)(billing_validation_1.BillingSchema), payment_controller_1.createBillingDetails);
router.get('/:id', middlewares_1.authenticate, payment_controller_1.getBillingDetails);
router.put('/:id', middlewares_1.authenticate, (0, validation_1.validate)(billing_validation_1.BillingSchema), payment_controller_1.updateBillingDetails);
router.get('/details', middlewares_1.authenticate, payment_controller_1.usersBillingDetails);
exports.default = {
    path: "/billing",
    router: router,
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = __importDefault(require("./subscription.controller"));
const authenticate_middleware_1 = require("../../middlewares/authenticate.middleware");
const router = (0, express_1.Router)();
const subscriptionController = new subscription_controller_1.default();
router.get('/', authenticate_middleware_1.authenticate, subscriptionController.getSubscriptions);
router.get('/:id', authenticate_middleware_1.authenticate, subscriptionController.getSubscription);
router.post('/', authenticate_middleware_1.authenticate, subscriptionController.createSubscription);
router.put('/:id', authenticate_middleware_1.authenticate, subscriptionController.updateSubscription);
router.delete('/:id', authenticate_middleware_1.authenticate, subscriptionController.deleteSubscription);
exports.default = router;

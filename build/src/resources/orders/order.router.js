"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const middlewares_1 = require("../../middlewares");
const order_validation_1 = require("./order.validation");
const constants_1 = require("../../helpers/constants");
const router = (0, express_1.Router)();
router.post('/checkout', middlewares_1.authenticate, (0, middlewares_1.validationMiddleware)(order_validation_1.createCheckoutSchema), order_controller_1.createCheckoutController);
// router.post('/testing', testingController)
router.get('/vendor', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.VENDOR), order_controller_1.getVendorOrdersController);
router.get('/customer', middlewares_1.authenticate, order_controller_1.getCustomerOrdersController);
router.route('/').post(middlewares_1.authenticate, (0, middlewares_1.validationMiddleware)(order_validation_1.createItemCheckoutSchema), order_controller_1.createItemCheckoutController);
router.post('/update-shipment', order_controller_1.updateShippingStatusController);
// router.post('/update-shipment', authenticate, validationMiddleware(updateShipmentSchema), updateShippingStatusController)
router.post('/acknowledge-shipment', middlewares_1.authenticate, (0, middlewares_1.validationMiddleware)(order_validation_1.acknowledgeShipmentSchema), order_controller_1.acknowledgeShipmentController);
exports.default = { path: '/orders', router };

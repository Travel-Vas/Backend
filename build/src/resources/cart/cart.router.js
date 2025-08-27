"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("./cart.controller");
const middlewares_1 = require("../../middlewares");
const middlewares_2 = require("../../middlewares");
const cart_validation_1 = require("./cart.validation");
const router = (0, express_1.Router)();
router.route('')
    .post(middlewares_1.authenticate, (0, middlewares_2.validationMiddleware)(cart_validation_1.addItemToCartSchema), cart_controller_1.addItemToCartController)
    .get(middlewares_1.authenticate, cart_controller_1.getCartController)
    .patch(middlewares_1.authenticate, (0, middlewares_2.validationMiddleware)(cart_validation_1.addItemToCartSchema), cart_controller_1.updateItemToCartController)
    .delete(middlewares_1.authenticate, cart_controller_1.emptyCartController);
exports.default = { path: '/cart', router };

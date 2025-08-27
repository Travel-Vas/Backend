"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_controller_1 = require("./index.controller");
const middlewares_1 = require("../../../middlewares");
const constants_1 = require("../../../helpers/constants");
const router = (0, express_1.Router)();
// Transfer routes
router.post('/initiate', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), index_controller_1.initiateTransfer);
router.post('/', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), index_controller_1.paystackTransfer);
router.post('/stripe', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), index_controller_1.stripeTransferController);
// Connected account routes
router.post('/connected-account', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), index_controller_1.createConnectedAccountController);
router.get('/connected-account/:accountId', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), index_controller_1.getConnectedAccountController);
router.get('/connected-accounts', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), index_controller_1.listConnectedAccountsController);
exports.default = {
    path: "/admin-transfer",
    router: router
};

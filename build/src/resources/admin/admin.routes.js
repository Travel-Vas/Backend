"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../middlewares");
const constants_1 = require("../../helpers/constants");
const admin_controller_1 = require("./admin.controller");
// import {ClientsController} from "../clients/clients.controller";
const client_controller_1 = require("./Clients/client.controller");
const payment_controller_1 = require("./payment/payment.controller");
const support_controller_1 = require("./support/support.controller");
const router = express_1.default.Router();
router.get("/analytics", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.DashboardController);
router.get("/photographers/analytics", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.PhotographersController);
router.get("/photographers", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.AllPhotographersController);
router.get("/photographer/:user_id", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.PhotographersProfileController);
router.get("/photographers/clients/:user_id", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.clientsListController);
router.get("/photographers/client_collections", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.clientsCollectionsController);
router.get("/photographers/shoot_details", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.clientCollectionDetailsController);
router.get("/photographers/transactions/:user_id", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.photographersTransactions);
router.get("/clients", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), client_controller_1.allClients);
router.get("/client/collections/:client_id", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), client_controller_1.clientsCollections);
router.get("/client/collections_details", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), client_controller_1.clientsCollectionDetails);
router.get("/payment-analytics", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), payment_controller_1.paymentAnalysis);
router.get("/transactions", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), payment_controller_1.allTransactions);
router.get("/transaction/:txnId", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), payment_controller_1.getTransaction);
router.get("/withdrawals", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), payment_controller_1.waitdrawals);
router.post("/support", middlewares_1.authenticate, support_controller_1.supportController);
router.post("/suspend-account", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.suspendAccountController);
router.get("/subscription-break-down", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.subscriptionBreakDownController);
router.get("/subscription-break-down/:id", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.singleSubscriptionBreakDownController);
router.get("/pay-as-you-go", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.payAsYouGoController);
router.get("/wallet-tracking", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.walletTrackingController);
router.get("/referral-break-down", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), payment_controller_1.referralRecordsAnalytics);
router.get("/single-referral-break-down", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), payment_controller_1.getUserReferalRecordAnalyticsController);
router.post("/assign-plan", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), admin_controller_1.assignPlanController);
exports.default = {
    path: "/admin",
    router: router
};

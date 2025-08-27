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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPlanController = exports.walletTrackingController = exports.payAsYouGoController = exports.singleSubscriptionBreakDownController = exports.subscriptionBreakDownController = exports.suspendAccountController = exports.photographersTransactions = exports.clientCollectionDetailsController = exports.clientsCollectionsController = exports.clientsListController = exports.PhotographersProfileController = exports.AllPhotographersController = exports.PhotographersController = exports.DashboardController = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const admin_service_1 = require("./admin.service");
const App_1 = require("../../helpers/lib/App");
const moderation_service_1 = require("../../utils/moderation_service");
const DashboardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, admin_service_1.DashboardService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.DashboardController = DashboardController;
const PhotographersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, admin_service_1.PhotographersService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.PhotographersController = PhotographersController;
const AllPhotographersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, admin_service_1.AllPhotographersService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.AllPhotographersController = AllPhotographersController;
const PhotographersProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.user_id;
    const response = yield (0, admin_service_1.PhotographersProfileService)(id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.PhotographersProfileController = PhotographersProfileController;
const clientsListController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const photographersId = req.params.user_id;
    const response = yield (0, admin_service_1.clientsListService)(photographersId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.clientsListController = clientsListController;
const clientsCollectionsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.user_id;
    const clientId = req.query.client_id;
    const response = yield (0, admin_service_1.clientsCollectionsService)(id, clientId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.clientsCollectionsController = clientsCollectionsController;
const clientCollectionDetailsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.user_id;
    const shootId = req.query.shoot_id;
    const response = yield (0, admin_service_1.clientCollectionDetailsService)(id, shootId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.clientCollectionDetailsController = clientCollectionDetailsController;
const photographersTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.user_id;
    if (!id) {
        throw new App_1.CustomError({
            message: 'Photographers Id is required',
            code: status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, admin_service_1.photographersTransactionsService)(id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.photographersTransactions = photographersTransactions;
const suspendAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    const reason = req.body.reason;
    const un_suspend = Number(req.body.un_suspend);
    console.log(un_suspend);
    const modraton = new moderation_service_1.ContentModerationService();
    const response = yield modraton.suspendUser(userId, reason, un_suspend);
    res.json({
        msg: "Suspension successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.suspendAccountController = suspendAccountController;
const subscriptionBreakDownController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const filter = req.query.filter
    const response = yield (0, admin_service_1.subscriptionBreakDownService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.subscriptionBreakDownController = subscriptionBreakDownController;
const singleSubscriptionBreakDownController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.Id;
    const response = yield (0, admin_service_1.singleSubscriptionBreakDownService)(id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.singleSubscriptionBreakDownController = singleSubscriptionBreakDownController;
const payAsYouGoController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield (0, admin_service_1.payAsYouGoService)(id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.payAsYouGoController = payAsYouGoController;
const walletTrackingController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = req.query.walletId;
    const response = yield (0, admin_service_1.walletTrackingService)(walletId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.walletTrackingController = walletTrackingController;
const assignPlanController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        planId: req.body.planId,
        userId: req.body.userId,
        duration: req.body.duration
    };
    if (!payload.duration || !payload.planId) {
        throw new App_1.CustomError({
            message: "Missing Fields! Duration or PlanId is missing",
            code: status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, admin_service_1.assignPlanService)(payload);
    res.json({
        msg: "Success",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.assignPlanController = assignPlanController;

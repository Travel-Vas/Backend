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
exports.deleteOrgProfilecontroller = exports.analyticsController = exports.orgProfileUpdateController = exports.orgProfileController = exports.logoutOrgController = exports._singleOrgController = exports._fetchAllOrgsController = exports._getOrgProfileController = exports._loginOrgController = exports._resetOrgPasswordController = exports._forgotOrgPasswordController = exports._resendOrgOtpController = exports.verifyOrgAccountController = exports.organizationController = void 0;
const http_status_codes_1 = require("http-status-codes");
const organization_service_1 = require("./organization.service");
const generator_1 = __importDefault(require("../../helpers/lib/generator"));
const notification_service_1 = require("../notificatoin/notification.service");
const organizationController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        name: req.body.name,
        location: req.body.location,
        rcNo: req.body.rcNo,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
        orgId: (0, generator_1.default)(),
        isVerified: req.body.isVerified
    };
    const newNotification = {
        userId: payload === null || payload === void 0 ? void 0 : payload.orgId,
        operationName: "Organization Registration",
        message: `${payload.name} just successfully got registered`
    };
    const newNotifications = yield (0, notification_service_1._notificationService)(newNotification);
    const response = yield (0, organization_service_1._OrgSignup)(payload);
    return res.json({
        msg: "organization created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
    });
});
exports.organizationController = organizationController;
const verifyOrgAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const response = yield (0, organization_service_1._verifyOrgAccount)(email, otp);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.verifyOrgAccountController = verifyOrgAccountController;
const _resendOrgOtpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otpType = req.body.otpType;
    const response = yield (0, organization_service_1._resendOrgOtp)(email, otpType);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports._resendOrgOtpController = _resendOrgOtpController;
const _forgotOrgPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const response = yield (0, organization_service_1._forgotOrgPassword)(email);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports._forgotOrgPasswordController = _forgotOrgPasswordController;
const _resetOrgPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const new_password = req.body.password;
    const response = yield (0, organization_service_1._resetOrgPassword)(email, otp, new_password);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports._resetOrgPasswordController = _resetOrgPasswordController;
const _loginOrgController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    const response = yield (0, organization_service_1._loginOrg)(email, password);
    let verifiedUser = response;
    let unverifiedUser = response;
    if (verifiedUser.user) {
        res.cookie('refresh_token', verifiedUser.tokens.refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
            secure: true
        });
        res.json({
            data: { user: verifiedUser.user, token: verifiedUser.tokens.accessToken }
        });
    }
    else {
        res.json({ data: unverifiedUser });
    }
});
exports._loginOrgController = _loginOrgController;
const _getOrgProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queryId = req.query.id;
    const userId = queryId ? queryId : req.user._id;
    const response = yield (0, organization_service_1._getOrgProfile)(userId);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports._getOrgProfileController = _getOrgProfileController;
const _fetchAllOrgsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, organization_service_1._fetchAllOrgs)();
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports._fetchAllOrgsController = _fetchAllOrgsController;
const _singleOrgController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield (0, organization_service_1._singleOrg)(id);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports._singleOrgController = _singleOrgController;
const logoutOrgController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("refresh_token", "jwt", { httpOnly: true });
    res.status(204).json({ data: null, statusCode: 204 });
});
exports.logoutOrgController = logoutOrgController;
const orgProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const response = yield (0, organization_service_1._getOrgProfile)(id);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.orgProfileController = orgProfileController;
const orgProfileUpdateController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const response = yield (0, organization_service_1._updateOrgProfile)(id, req.body);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.orgProfileUpdateController = orgProfileUpdateController;
const analyticsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield (0, organization_service_1._analyticsService)(id);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.analyticsController = analyticsController;
const deleteOrgProfilecontroller = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield (0, organization_service_1._deleteOrgProfileService)(id, req.query.flag, req.query.deletes);
    return res.json({
        msg: "OK",
        data: "",
        statusCode: http_status_codes_1.StatusCodes.OK,
    });
});
exports.deleteOrgProfilecontroller = deleteOrgProfilecontroller;

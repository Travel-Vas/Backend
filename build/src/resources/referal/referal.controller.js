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
exports.redeemReward = exports.allReferals = exports.getReferalDetails = exports.createReferal = void 0;
const referal_interface_1 = require("./referal.interface");
const http_status_codes_1 = require("http-status-codes");
const App_1 = require("../../helpers/lib/App");
const referal_service_1 = require("./referal.service");
const validator_1 = require("../../utils/validator");
const createReferal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        referrer: req.body.referrer,
        referred: req.body.userId,
        status: referal_interface_1.RFStatus.PENDING,
    };
    (0, validator_1.validateFields)({ referred: req.body.userId });
    const response = yield (0, referal_service_1.createReferalService)(payload);
    res.json({
        msg: "referrenced successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.createReferal = createReferal;
const getReferalDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.refererId;
    (0, validator_1.validateFields)({ referralId: id });
    const response = yield (0, referal_service_1.getReferalDetailsService)(id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getReferalDetails = getReferalDetails;
const allReferals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const referalCode = req.params.refererCode;
    const response = yield (0, referal_service_1.allReferalsService)(referalCode);
    res.json({
        msg: "referrenced successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.allReferals = allReferals;
const redeemReward = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        referralCode: req.body.referralCode,
    };
    if (!payload.referralCode) {
        throw new App_1.CustomError({
            message: "Referral code is required",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, referal_service_1.redeemRewardService)(payload);
    res.json({
        msg: "Reward redeemed successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.redeemReward = redeemReward;

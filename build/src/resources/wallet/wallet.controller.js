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
exports.verifyOtpAndResetPin = exports.listBanks = exports.singleWithdrawals = exports.allWithdrawals = exports.allCurrencie = exports.exchangeController = exports.resetPin = exports.createPin = exports.withdrawWallet = exports.depositToWallet = exports.updateWalletStatus = exports.getUsersWallet = exports.createWallet = void 0;
const wallet_interface_1 = require("./wallet.interface");
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const wallet_service_1 = require("./wallet.service");
const createWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        balance: 0,
        currency: req.body.currency,
        status: 'active'
    };
    if (!Object.values(wallet_interface_1.CurrencyType).includes(payload.currency)) {
        throw new App_1.CustomError({
            message: 'Invalid Currency Type',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, wallet_service_1.createWalletService)(payload);
    res.json({
        msg: "Wallet created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.createWallet = createWallet;
const getUsersWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, wallet_service_1.getUsersWalletService)(userId);
    res.json({
        msg: "Wallet retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getUsersWallet = getUsersWallet;
const updateWalletStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const status = req.body.status;
    if (status !== 'active' || status !== 'frozen' || status !== 'closed') {
        throw new App_1.CustomError({
            message: `status must fall in these category: \'active\' | \'frozen\' | \'closed\'`,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, wallet_service_1.updateWalletStatusService)(userId, status);
    res.json({
        msg: "Wallet status changed",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.updateWalletStatus = updateWalletStatus;
const depositToWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        walletNo: req.body.walletNumber,
        amount: Number(req.body.amount),
        clientId: req.body.clientId,
    };
    if (payload.amount < 0) {
        throw new App_1.CustomError({
            message: 'Amount must be greater than zero',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (!payload.walletNo) {
        throw new App_1.CustomError({
            message: "Receiver wallet number required",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, wallet_service_1.depositToWalletService)(payload);
    res.json({
        msg: "Deposit successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.depositToWallet = depositToWallet;
const withdrawWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req.body.userId,
        transactionReference: req.body.transactionReference,
        adminId: req['user']._id,
        ip: req.ip
    };
    const response = yield (0, wallet_service_1.adminApproveWithdrawalService)(payload);
    res.json({
        msg: "Success",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.withdrawWallet = withdrawWallet;
const createPin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        pin: req.body.pin,
    };
    if (!payload.pin) {
        throw new App_1.CustomError({
            message: 'Transaction Pin is required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, wallet_service_1.createPinService)(payload);
    res.json({
        msg: "Success",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.createPin = createPin;
const resetPin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
    };
    const response = yield (0, wallet_service_1.resetPinService)(payload);
    res.json({
        msg: response.message,
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.resetPin = resetPin;
const exchangeController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, wallet_service_1.getExchangeRate)(req.body.fromCurrency, req.body.toCurrency, req.body.amount);
    res.json({
        msg: "successful",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.exchangeController = exchangeController;
const allCurrencie = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, wallet_service_1.allCurrencies)();
    res.json({
        msg: "successful",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.allCurrencie = allCurrencie;
const allWithdrawals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter } = req.query;
    const response = yield (0, wallet_service_1.allWithdrawalsService)(filter);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.allWithdrawals = allWithdrawals;
const singleWithdrawals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const response = yield (0, wallet_service_1.singleWithdrawalsService)(id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.singleWithdrawals = singleWithdrawals;
const listBanks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, wallet_service_1.listBanksService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.listBanks = listBanks;
const verifyOtpAndResetPin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        otp: req.body.otp,
        newPin: req.body.newPin,
    };
    // Validate required fields
    if (!payload.otp) {
        throw new App_1.CustomError({
            message: 'OTP is required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (!payload.newPin) {
        throw new App_1.CustomError({
            message: 'New PIN is required',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // Validate PIN format
    if (!/^\d{4,6}$/.test(payload.newPin)) {
        throw new App_1.CustomError({
            message: 'PIN must be between 4-6 digits',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, wallet_service_1.verifyOtpAndResetPinService)(payload);
    res.json({
        msg: response.message,
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.verifyOtpAndResetPin = verifyOtpAndResetPin;

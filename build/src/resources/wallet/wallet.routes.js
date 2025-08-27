"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../middlewares");
const wallet_controller_1 = require("./wallet.controller");
const constants_1 = require("../../helpers/constants");
const router = express_1.default.Router();
router.post("/", middlewares_1.authenticate, wallet_controller_1.createWallet);
router.get("/users", middlewares_1.authenticate, wallet_controller_1.getUsersWallet);
router.patch("/status", middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), wallet_controller_1.updateWalletStatus);
router.post("/deposit", middlewares_1.authenticate, wallet_controller_1.depositToWallet);
router.post("/withdrawal", middlewares_1.authenticate, wallet_controller_1.withdrawWallet);
router.post("/pin", middlewares_1.authenticate, wallet_controller_1.createPin);
router.get("/reset-pin", middlewares_1.authenticate, wallet_controller_1.resetPin);
router.post("/verify-otp-reset-pin", middlewares_1.authenticate, wallet_controller_1.verifyOtpAndResetPin);
router.post("/exchange-rate", wallet_controller_1.exchangeController);
router.get("/currencies", wallet_controller_1.allCurrencie);
router.get('/all-withdrawals', middlewares_1.authenticate, wallet_controller_1.allWithdrawals);
router.get('/withdrawal-details/:id', middlewares_1.authenticate, wallet_controller_1.singleWithdrawals);
router.get('/banks', middlewares_1.authenticate, wallet_controller_1.listBanks);
exports.default = {
    path: '/wallet',
    router: router,
};

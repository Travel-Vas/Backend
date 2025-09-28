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
exports.totalUsersController = exports.refreshTokenController = exports.logoutController = exports.deleteAccountController = exports.updatePasswordController = exports.changePasswordController = exports.unboardingController = exports.updateAdminProfileController = exports.updateProfileController = exports.getAdminProfileController = exports.getProfileController = exports.loginController = exports.actual_resetPasswordController = exports.resetPasswordController = exports.forgotPasswordController = exports.resendOTPController = exports.verifyAccountController = exports.signupController = void 0;
const user_service_1 = require("./user.service");
const App_1 = require("../../helpers/lib/App");
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const user_model_1 = __importDefault(require("./user.model"));
const signupController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { ip: req.body.ip, referrerCode: req.body.referrerCode });
    const message = yield (0, user_service_1._signup)(payload);
    res.json({
        msg: "user created successfully",
        data: message,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.signupController = signupController;
const verifyAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, user_service_1._verifyAccount)(req.body.email, req.body.otp);
    res.cookie('refresh_token', data.tokens.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });
    res.json({
        data: { user: data.user, token: data.tokens.accessToken }
    });
});
exports.verifyAccountController = verifyAccountController;
const resendOTPController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield (0, user_service_1._resendOTP)(req.body.email, req.body.otpType);
    res.json({ data: { message } });
});
exports.resendOTPController = resendOTPController;
const forgotPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield (0, user_service_1._forgotPassword)(req.body.email);
    res.json({ data: { message } });
});
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield (0, user_service_1._resetOtp)(req.body.email, req.body.otp, req.body.new_password);
    res.json({ data: { message } });
});
exports.resetPasswordController = resetPasswordController;
const actual_resetPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        new_password: req.body.password,
    };
    const message = yield (0, user_service_1._resetPassword)(req.body.email, payload.new_password);
    res.json({ data: { message } });
});
exports.actual_resetPasswordController = actual_resetPasswordController;
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, user_service_1._login)(req.body.email, req.body.password);
    let verifiedUser = data;
    let unverifiedUser = data;
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
exports.loginController = loginController;
const getProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield user_model_1.default.findById(req.user._id).populate("referralCode", "referralCode").lean();
    res.json({
        data: { user: Object.assign(Object.assign({}, response), { password: undefined }) }
    });
});
exports.getProfileController = getProfileController;
const getAdminProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield user_model_1.default.findById(req.query.id).lean();
    res.json({
        data: { user: Object.assign(Object.assign({}, response), { password: undefined }) }
    });
});
exports.getAdminProfileController = getAdminProfileController;
const updateProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const payload = Object.assign(Object.assign({}, req.body), { profile_image: req.file });
    const data = yield (0, user_service_1._updateProfile)(userId, payload);
    res.status(200).json({ data, msg: "Successful" });
});
exports.updateProfileController = updateProfileController;
const updateAdminProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const data = yield (0, user_service_1._updateProfile)(userId, req.body);
    res.status(200).json({ data, msg: "Successful" });
});
exports.updateAdminProfileController = updateAdminProfileController;
const unboardingController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        postalCode: req.body.postalCode,
        userId: req['user']._id
    };
    const data = yield (0, user_service_1.unboardingService)(payload);
    res.status(200).json({ data, msg: "Successful" });
});
exports.unboardingController = unboardingController;
const changePasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const payload = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        userId: userId
    };
    if (!payload.currentPassword || !payload.newPassword) {
        throw new App_1.CustomError({
            message: "Either Current Password || New Password is missing",
            code: status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const data = yield (0, user_service_1.changePasswordService)(payload);
    res.json({ data, msg: "Successful" });
});
exports.changePasswordController = changePasswordController;
// export const updateProfileImageController = async (req: Request, res: CustomResponse<any>) => {
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   let file: any = {}
//   if (!files || !files["profile_image"]) throw new CustomError({ message: "Please Provide a Profile Image" })
//   if (files && files['profile_image']) {
//     file.buffer = files['profile_image'][0].buffer
//     file.mimetype = files['profile_image'][0].mimetype
//   }
//   const data = await _updateProfilePhoto(file, req.user._id)
//   res.status(200).json({ data, msg: "Successful" })
// }
const updatePasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, user_service_1._updatePassword)(req.user._id, req.body.old_password, req.body.new_password);
    res.cookie('refresh_token', data.refresh_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });
    res.json({ data: { token: data.access_token } });
});
exports.updatePasswordController = updatePasswordController;
// export const addShippingAddressController = async (req: Request, res: CustomResponse<any>) => {
//   const data = await _addShippingAddress(req.user._id, req.body.addresses)
//   res.status(200).json({ data, msg: "Successful" })
// }
// export const deleteShippingAddressController = async (req: Request, res: CustomResponse<any>) => {
//   const data = await _deleteShippingAddress(req.user._id, req.body.index)
//   res.status(200).json({ data, msg: "Successful" })
// }
const deleteAccountController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, user_service_1._deleteAccount)(req.user._id, req.body.password);
    res.cookie('refresh_token', data.refresh_token, { httpOnly: true });
    res.json({ data });
});
exports.deleteAccountController = deleteAccountController;
const logoutController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.status(204).json({ data: null, statusCode: 204 });
});
exports.logoutController = logoutController;
const refreshTokenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refresh_token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token) ? req.cookies.refresh_token : '';
    const tokens = yield (0, user_service_1._refreshToken)(refresh_token);
    res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });
    res.status(200).json({ data: { token: tokens.access_token }, statusCode: 200 });
});
exports.refreshTokenController = refreshTokenController;
const totalUsersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, user_service_1.totalUsersService)();
    res.json({ data, msg: "Successful" });
});
exports.totalUsersController = totalUsersController;

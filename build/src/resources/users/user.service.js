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
exports.totalUsersService = exports.changePasswordService = exports.unboardingService = exports._deleteCoordinatorsService = exports._allCoordinatorsService = exports._refreshToken = exports._deleteAccount = exports._updatePassword = exports._updateProfile = exports._login = exports._resetPassword = exports._resetOtp = exports._forgotPassword = exports._resendOTP = exports._verifyAccount = exports._signup = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const user_model_2 = __importDefault(require("./user.model"));
const App_1 = require("../../helpers/lib/App");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const app_1 = require("../../app");
const http_status_codes_1 = require("http-status-codes");
const cloudinary_1 = require("../../utils/cloudinary");
const promises_1 = __importDefault(require("node:fs/promises"));
const _signup = (data) => __awaiter(void 0, void 0, void 0, function* () {
    //check if email already exist
    const emailExist = yield user_model_1.default.findOne({ email: data.email }).lean().exec();
    if (emailExist) {
        throw new App_1.CustomError({
            message: "email or user already exist",
            code: http_status_codes_1.StatusCodes.CONFLICT,
        });
    }
    const newPayload = Object.assign({}, data);
    //save user
    const user = yield user_model_1.default.create(Object.assign(Object.assign({}, newPayload), { password: yield bcryptjs_1.default.hash(data.password, 10) }));
    //generate otp
    const otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    console.log(otp);
    //send otp to user email
    yield new App_1.EmailService().sendOTP("Account Verification", user.email, user.name, otp);
    console.log("otp sent to mail", otp);
    //save otp in memory
    const client = yield app_1.redis_client.getRedisClient();
    client.set(user.email, yield bcryptjs_1.default.hash(otp, 10), "EX", 60 * 10);
    //return message
    return "check Email. OTP sent";
});
exports._signup = _signup;
const _verifyAccount = (user_email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient();
    const hashed_otp = yield client.get(user_email);
    // console.log(hashed_otp);
    if (!hashed_otp)
        throw new App_1.CustomError({
            message: "OTP is either incorrect or has expired.",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    if (!(yield bcryptjs_1.default.compare(otp, hashed_otp)))
        throw new App_1.CustomError({
            message: "OTP is either incorrect or has expired.",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    // const user = await userModel.findOneAndUpdate({is_verified: true}, {email: user_email})
    const user = yield user_model_1.default.findOne({ email: user_email });
    if (!user)
        throw new App_1.CustomError({
            message: "OTP is either incorrect or has expired.",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    user.is_verified = true;
    yield user.save();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
        console.log("Invalid email format");
        throw new App_1.CustomError({
            message: "Invalid email format",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // //send welcome Email
    yield new App_1.EmailService().welcome("Welcome To Travelvas", user.email, user.name.split(" ")[0]);
    yield client.del(user.email);
    const accessToken = (0, App_1.createToken)(user.id, user.role, "1d");
    const refreshToken = (0, App_1.createToken)(user.id, user.role, "30d");
    const data = user.toObject({
        transform: (doc, ret) => {
            delete ret.password;
        },
    });
    return {
        user: data,
        tokens: {
            accessToken,
            refreshToken,
        },
    };
});
exports._verifyAccount = _verifyAccount;
const _resendOTP = (user_email, otpType) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ email: user_email });
    if (!user)
        throw new App_1.CustomError({ message: "Email not found", code: 404 });
    //generate otp
    const otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    const client = yield app_1.redis_client.getRedisClient();
    yield client.set(user_email, yield bcryptjs_1.default.hash(otp, 10), "EX", 60 * 10);
    //send otp to email
    console.log(otp);
    yield new App_1.EmailService().sendOTP(otpType, user.email, user.name.split(" ")[0], otp);
    return "OTP sent to email.";
});
exports._resendOTP = _resendOTP;
const _forgotPassword = (user_email) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_model_1.default.findOne({ email: user_email });
    if (!user)
        throw new App_1.CustomError({ message: "Email not found", code: 400 });
    const client = yield app_1.redis_client.getRedisClient();
    //generate otp
    const otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    yield client.set(user_email, yield bcryptjs_1.default.hash(otp, 10), "EX", 60 * 10);
    //send otp to email
    console.log(otp);
    yield new App_1.EmailService().sendOTP("Forgot Password", user.email, (_a = user.name) !== null && _a !== void 0 ? _a : "", otp);
    return "OTP sent to email.";
});
exports._forgotPassword = _forgotPassword;
const _resetOtp = (user_email, otp, new_password) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient();
    const hashed_otp = yield client.get(user_email);
    // console.log(hashed_otp, otp);
    if (!hashed_otp)
        throw new App_1.CustomError({ message: "OTP has expired", code: 401 });
    if (!(yield bcryptjs_1.default.compare(otp, hashed_otp)))
        throw new App_1.CustomError({ message: "OTP is invalid", code: 401 });
    const user = yield user_model_1.default.findOneAndUpdate({ email: user_email }, { password: new_password });
    if (!user)
        throw new App_1.CustomError({ message: "OTP has expired or invalid", code: 401 });
    yield client.del(user.email);
    return "Otp Updated Successfully.";
});
exports._resetOtp = _resetOtp;
const _resetPassword = (user_email, new_password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcryptjs_1.default.hash(new_password, 10);
    const user = yield user_model_1.default.findOneAndUpdate({ email: user_email }, { password: hashedPassword });
    if (!user) {
        throw new App_1.CustomError({
            message: 'User not found',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    return "Password updated successfully";
});
exports._resetPassword = _resetPassword;
/**
 *
 * @param email
 * @param password
 */
const _login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!password || !email)
        throw new App_1.CustomError({
            message: "username or password is required",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    const user = yield user_model_1.default.findOne({ email: email }).populate("referralCode");
    // console.log(user)
    if (!user)
        throw new App_1.CustomError({
            message: "username or password is incorrect",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    // if(!(await bcrypt.compare(password, user.password))) throw new CustomError({message: 'username or password is incorrect', code: 401})
    if (!(yield bcryptjs_1.default.compare(password, user.password)))
        throw new App_1.CustomError({
            message: "username or password is incorrect",
            code: 401,
        });
    if (!user.is_verified) {
        return {
            email: user.email,
            message: "Verify your account to start your journey",
        };
    }
    if (user.isSuspended) {
        throw new App_1.CustomError({
            message: "User account is temporarily suspended",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED
        });
    }
    //generate tokens
    const accessToken = (0, App_1.createToken)(user._id, user.role, "1d");
    const refreshToken = (0, App_1.createToken)(user._id, user.role, "30d");
    // const data = user.toObject({ transform: (doc, ret) => { delete ret.password; } });
    const data = user.toObject({
        transform: (doc, ret) => {
            delete ret.password;
        },
    });
    // handle subscription
    return {
        user: data,
        tokens: {
            accessToken,
            refreshToken,
        },
    };
});
exports._login = _login;
const _updateProfile = (user_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a copy of the data object to modify
    const updateData = Object.assign({}, data);
    // Handle profile image upload if provided
    const thumbnailFile = data.profile_image;
    const newFiles = [];
    if (thumbnailFile) {
        try {
            const originalUpload = yield (0, cloudinary_1.uploadFilePathToCloudinary)(thumbnailFile.path, "profile_pictures");
            if (!originalUpload || !originalUpload.secure_url) {
                throw new Error('Cloudinary upload failed or returned invalid data');
            }
            const watermarkedUrl = originalUpload.secure_url;
            newFiles.push({
                url: watermarkedUrl,
                name: thumbnailFile.originalname || 'unnamed-file',
                size: thumbnailFile.size || 0,
                type: thumbnailFile.mimetype || 'application/octet-stream'
            });
            // Clean up temp file
            try {
                yield promises_1.default.unlink(thumbnailFile.path);
            }
            catch (unlinkErr) {
                console.error(`Warning: Error deleting temp file: ${unlinkErr}`);
            }
        }
        catch (error) {
            if (thumbnailFile.path) {
                try {
                    yield promises_1.default.unlink(thumbnailFile.path).catch(() => { });
                }
                catch (_a) {
                    // Silently ignore cleanup errors
                }
            }
            console.error(`Error processing thumbnail file: ${error}`);
            throw new App_1.CustomError({
                message: `Error processing thumbnail file: ${error.message}`,
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }
    const newPayload = Object.assign(Object.assign({}, updateData), { profile_image: newFiles });
    if (data.password) {
        updateData.password = yield bcryptjs_1.default.hash(data.password, 10);
    }
    if (data.country) {
        updateData.country = data.country;
    }
    if (data.business_country) {
        updateData.business_country = data.business_country;
    }
    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
            delete updateData[key];
        }
    });
    const response = yield user_model_1.default
        .findOneAndUpdate({ _id: user_id }, newPayload, {
        new: true,
    })
        .select("-password");
    return response;
});
exports._updateProfile = _updateProfile;
const _updatePassword = (user_id, old_password, new_password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: user_id }, { __v: 0 });
    if (!user)
        throw new App_1.CustomError({ message: "Unauthorized access", code: 401 });
    if (!user.password)
        throw new App_1.CustomError({
            message: "Unauthorized access. You registered with google",
            code: 401,
        });
    if (!(yield bcryptjs_1.default.compare(old_password, user.password)))
        throw new App_1.CustomError({ message: "Password not correct", code: 401 });
    yield user_model_1.default.findOneAndUpdate({ _id: user_id }, { password: yield bcryptjs_1.default.hash(new_password, 10) });
    //generate tokens
    const accessToken = (0, App_1.createToken)(user.id, user.role, "60m");
    const refreshToken = (0, App_1.createToken)(user.id, user.role, "30d");
    return {
        access_token: accessToken,
        refresh_token: refreshToken,
    };
});
exports._updatePassword = _updatePassword;
const _deleteAccount = (user_id, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ _id: user_id }, { __v: 0 });
    if (!user)
        throw new App_1.CustomError({ message: "Unauthorized access", code: 401 });
    if (user.password) {
        if (!(yield bcryptjs_1.default.compare(password, user.password)))
            throw new App_1.CustomError({ message: "Unauthorized access", code: 401 });
    }
    yield user_model_1.default.findOneAndUpdate({ status: false }, { _id: user_id });
    return { refresh_token: "null" };
});
exports._deleteAccount = _deleteAccount;
const _refreshToken = (refresh_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = yield (0, App_1.verifyToken)(refresh_token);
        if (decoded instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new App_1.CustomError({
                message: "access token invalid",
                code: 401,
                ctx: { data: "invalid bearer token" },
            });
        }
        const user = yield user_model_1.default.findOne({ _id: decoded.id });
        if (!user) {
            throw new App_1.CustomError({
                message: "access token invalid",
                code: 401,
                ctx: { data: "invalid bearer token" },
            });
        }
        return {
            access_token: (0, App_1.createToken)(user.id, user.role, "60m"),
            refresh_token: (0, App_1.createToken)(user.id, user.role, "30d"),
        };
    }
    catch (e) {
        throw new App_1.CustomError({
            message: "access token invalid",
            code: 401,
            ctx: { data: "invalid bearer token" },
        });
    }
});
exports._refreshToken = _refreshToken;
const _allCoordinatorsService = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield user_model_1.default.find().exec();
    // console.log(data)
    const promised = [];
    for (const item of data) {
        if (item.isDeleted === false) {
            promised.push(item);
        }
    }
    return promised;
});
exports._allCoordinatorsService = _allCoordinatorsService;
const _deleteCoordinatorsService = (id, flag, deletes) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.default.findOne({ _id: id }).lean().exec();
    if (!isExist) {
        throw new App_1.CustomError({
            message: "user not found",
            code: 404,
            ctx: { data: "invalid id provided" },
        });
    }
    console.log(flag);
    if (flag && flag === 'false') {
        console.log(flag);
        isExist.isDeleted = false;
        yield user_model_1.default.findByIdAndUpdate(id, { isDeleted: false }, { new: true }).lean().exec();
    }
    else if (deletes) {
        yield user_model_1.default.findByIdAndDelete(id).lean().exec();
    }
    else {
        isExist.isDeleted = true;
        yield user_model_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean().exec();
    }
    // Assuming isDeleted is a field in your user schema
    return isExist;
});
exports._deleteCoordinatorsService = _deleteCoordinatorsService;
const unboardingService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDetails = yield user_model_2.default.findOne({
            _id: payload.userId,
            $or: [
                { country: { $in: [null, ''] } },
                { state: { $in: [null, ''] } },
                { city: { $in: [null, ''] } }
            ]
        }).lean().exec();
        if (!userDetails) {
            throw new App_1.CustomError({
                message: "User not found or user already has complete location data",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Update the user with the provided payload
        const response = yield user_model_2.default.findByIdAndUpdate(payload.userId, {
            country: payload.country,
            state: payload.state,
            city: payload.city,
            postalCode: payload.postalCode,
            isUnboarded: true,
        }, { new: true });
        return response;
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.unboardingService = unboardingService;
const changePasswordService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by ID
        const user = yield user_model_1.default.findById(payload.userId).select("+password");
        if (!user) {
            throw new App_1.CustomError({
                message: "User not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        // Check if user has a password (not registered with Google/social login)
        if (!user.password) {
            throw new App_1.CustomError({
                message: "Cannot change password. Account registered with social login.",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Verify current password
        const isCurrentPasswordValid = yield bcryptjs_1.default.compare(payload.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new App_1.CustomError({
                message: "Current password is incorrect",
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
            });
        }
        // Check if new password is different from current password
        const isSamePassword = yield bcryptjs_1.default.compare(payload.newPassword, user.password);
        if (isSamePassword) {
            throw new App_1.CustomError({
                message: "New password must be different from current password",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Hash the new password
        const hashedNewPassword = yield bcryptjs_1.default.hash(payload.newPassword, 10);
        // Update the user's password
        yield user_model_1.default.findByIdAndUpdate(payload.userId, { password: hashedNewPassword }, { new: true });
        // Generate new tokens for security
        const accessToken = (0, App_1.createToken)(user._id, user.role, "1d");
        const refreshToken = (0, App_1.createToken)(user._id, user.role, "30d");
        return {
            message: "Password changed successfully",
            tokens: {
                accessToken,
                refreshToken,
            },
        };
    }
    catch (error) {
        // If it's already a CustomError, re-throw it
        if (error instanceof App_1.CustomError) {
            throw error;
        }
        // Otherwise, wrap it in a CustomError
        throw new App_1.CustomError({
            message: error.message || "Failed to change password",
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.changePasswordService = changePasswordService;
const totalUsersService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield user_model_2.default.find();
        return response;
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.totalUsersService = totalUsersService;

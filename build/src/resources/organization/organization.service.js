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
exports._deleteOrgProfileService = exports._updateOrgProfile = exports._analyticsService = exports._singleOrg = exports._fetchAllOrgs = exports._getOrgProfile = exports._loginOrg = exports._resetOrgPassword = exports._forgotOrgPassword = exports._resendOrgOtp = exports._verifyOrgAccount = exports._OrgSignup = void 0;
const http_status_codes_1 = require("http-status-codes");
const App_1 = require("../../helpers/lib/App");
const organization_model_1 = __importDefault(require("./organization.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const app_1 = require("../../app");
const test_models_1 = __importDefault(require("../test/test.models"));
const user_model_1 = __importDefault(require("../users/user.model"));
const _OrgSignup = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield organization_model_1.default.findOne({ email: data.email }).exec();
    if (isExist) {
        throw new App_1.CustomError({
            message: "email already exist",
            code: http_status_codes_1.StatusCodes.CONFLICT,
        });
    }
    const user = yield organization_model_1.default.create(Object.assign(Object.assign({}, data), { password: yield bcryptjs_1.default.hash(data.password, 10) }));
    const otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    console.log(otp);
    //send otp to user email
    new App_1.EmailService().sendOTP("Account Verification", user.email, user.name, otp);
    // console.log("otp sent to mail");
    //save otp in memory
    const client = yield app_1.redis_client.getRedisClient();
    client.set(user.email, yield bcryptjs_1.default.hash(otp, 10), "EX", 60 * 10);
    //return message
    return "check Email. OTP sent";
});
exports._OrgSignup = _OrgSignup;
const _verifyOrgAccount = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient();
    const hashed_otp = yield client.get(email);
    console.log(hashed_otp);
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
    const user = yield organization_model_1.default.findOne({ email: email });
    if (!user)
        throw new App_1.CustomError({
            message: "OTP is either incorrect or has expired.",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    user.isVerified = true;
    yield user.save();
    yield new App_1.EmailService().welcome("Welcome To EvON Medics", user.email, user.name.split(" ")[0]);
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
exports._verifyOrgAccount = _verifyOrgAccount;
const _resendOrgOtp = (user_email, otpType) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield organization_model_1.default.findOne({ email: user_email });
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
exports._resendOrgOtp = _resendOrgOtp;
const _forgotOrgPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield organization_model_1.default.findOne({ email: email });
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
    yield client.set(email, yield bcryptjs_1.default.hash(otp, 10), "EX", 60 * 10);
    //send otp to email
    console.log(otp);
    yield new App_1.EmailService().sendOTP("Forgot Password", email, user === null || user === void 0 ? void 0 : user.name, otp);
    return "OTP sent to email.";
});
exports._forgotOrgPassword = _forgotOrgPassword;
const _resetOrgPassword = (email, otp, new_password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield app_1.redis_client.getRedisClient();
        const hashed_otp = yield client.get(email);
        console.log(hashed_otp, otp);
        if (!hashed_otp)
            throw new App_1.CustomError({ message: "OTP has expired", code: 401 });
        if (!(yield bcryptjs_1.default.compare(otp, hashed_otp)))
            throw new App_1.CustomError({ message: "OTP is invalid", code: 401 });
        const hashedPassword = yield bcryptjs_1.default.hash(new_password, 10);
        const user = yield organization_model_1.default.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } }, { new: true });
        if (!user)
            throw new App_1.CustomError({ message: "OTP has expired or invalid", code: 401 });
        // await client.del(user.email);
        return "Password Updated Successfully.";
    }
    catch (error) {
        console.log(error);
    }
});
exports._resetOrgPassword = _resetOrgPassword;
const _loginOrg = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!password || !email)
        throw new App_1.CustomError({
            message: "username or password is required",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    const user = yield organization_model_1.default.findOne({ email }, { __v: 0 });
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
    if (!user.isVerified) {
        return {
            email: user.email,
            message: "Verify your account to start your journey",
        };
    }
    //generate tokens
    const accessToken = (0, App_1.createToken)(user.id, user.role, "1d");
    const refreshToken = (0, App_1.createToken)(user.id, user.role, "30d");
    // const data = user.toObject({ transform: (doc, ret) => { delete ret.password; } });
    // these is to remove password from the payload
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
exports._loginOrg = _loginOrg;
const _getOrgProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield organization_model_1.default
        .findOne({ _id: userId })
        .select("-password")
        .exec();
});
exports._getOrgProfile = _getOrgProfile;
const _fetchAllOrgs = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield organization_model_1.default.find().select("-password").exec();
    const promised = [];
    for (const item of response) {
        if (item.isDeleted === false) {
            promised.push(item);
        }
    }
    return promised;
});
exports._fetchAllOrgs = _fetchAllOrgs;
const _singleOrg = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield organization_model_1.default.findOne({ _id: id }).exec();
});
exports._singleOrg = _singleOrg;
const _analyticsService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve test records and coordinators based on the organization ID if provided
        const testRecords = id
            ? yield test_models_1.default.find({ organizationId: id }).exec()
            : yield test_models_1.default.find().exec();
        const coordinators = yield user_model_1.default.find().exec();
        // Calculate total participants and coordinators
        const numParticipants = testRecords.length;
        const numCoordinators = coordinators.length;
        // Calculate total score and average score
        const totalScore = testRecords.reduce((acc, participant) => acc + parseInt(participant.total_score || 0), 0);
        const averageScore = Math.round(totalScore / (numParticipants || 1));
        // Calculate total error
        const totalError = testRecords.reduce((acc, participant) => acc + parseInt(participant.total_error || 0), 0);
        // Calculate total latency
        const totalLatency = testRecords.reduce((acc, participant) => acc + parseFloat(participant.latency2 || 0), 0);
        // Return analytics summary
        return [
            { label: "Total Participants", value: numParticipants },
            { label: "Total Coordinators", value: numCoordinators },
            { label: "Total Score", value: totalScore },
            { label: "Average Score", value: averageScore },
            { label: "Total Error", value: totalError },
            { label: "Total Latency", value: totalLatency.toFixed(2) }, // Round latency to 2 decimal places
        ];
    }
    catch (error) {
        console.error(error);
        throw new App_1.CustomError({
            message: error.message,
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports._analyticsService = _analyticsService;
const _updateOrgProfile = (user_id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, data), { password: yield bcryptjs_1.default.hash(data.password, 10) });
    return yield organization_model_1.default
        .findOneAndUpdate({ _id: user_id }, payload, {
        // runValidators: true,
        new: true,
    })
        .select("-password");
});
exports._updateOrgProfile = _updateOrgProfile;
const _deleteOrgProfileService = (id, flag, deletes) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield organization_model_1.default.findById(id).lean().exec();
        if (!isExist) {
            throw new App_1.CustomError({
                message: "organization not found",
                code: 404,
                ctx: { data: "invalid id provided" },
            });
        }
        if (flag) {
            isExist.isDeleted = false;
            yield organization_model_1.default
                .findByIdAndUpdate(id, { isDeleted: false }, { new: true })
                .lean()
                .exec();
        }
        else if (deletes) {
            yield organization_model_1.default.findByIdAndDelete(id).lean().exec();
        }
        else {
            isExist.isDeleted = true;
            yield organization_model_1.default
                .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
                .lean()
                .exec();
        }
        return "deleted";
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "something went wrong",
            code: 500,
            ctx: { data: error },
        });
    }
});
exports._deleteOrgProfileService = _deleteOrgProfileService;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpload = exports.thumbNailUpload = exports.cleanupTempFiles = exports.upload = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const validation_middleware_1 = require("../../middlewares/validation.middleware");
const middlewares_1 = require("../../middlewares");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const App_1 = require("../../helpers/lib/App");
const fs = __importStar(require("node:fs"));
const router = (0, express_1.Router)();
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }
// Configure disk storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // You can customize the destination based on request if needed
        const dest = path_1.default.join(uploadDir, 'temp');
        // console.log('destination beign called', dest);
        // // Create the directory if it doesn't exist
        // if (!fs.existsSync(dest)) {
        //   fs.mkdirSync(dest, { recursive: true });
        // }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Create a unique filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        console.log('filename beign called', `${uniqueSuffix}.${ext}`);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 10MB in bytes
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
    // console.log('filefilter beign called', `${ext}.${allowedExtensions}`);
    // Check file extension
    if (allowedExtensions.indexOf(ext) === -1) {
        return cb(new App_1.CustomError({ message: 'Only images are allowed!', code: 400 }));
    }
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return cb(new App_1.CustomError({ message: 'File is too large! Maximum size is 10MB', code: 400 }));
    }
    cb(null, true);
};
exports.upload = (0, multer_1.default)({ storage: storage, fileFilter: fileFilter });
const cleanupTempFiles = (filePaths) => {
    filePaths.forEach(filePath => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error(`Error deleting temporary file ${filePath}:`, error);
        }
    });
};
exports.cleanupTempFiles = cleanupTempFiles;
exports.thumbNailUpload = exports.upload.single('thumb_nail');
exports.profileUpload = exports.upload.single('profile');
router.post('/register', (0, validation_middleware_1.validationMiddleware)(user_validation_1.createUserSchema), user_controller_1.signupController);
router.post('/verify-account', (0, validation_middleware_1.validationMiddleware)(user_validation_1.verifyAccountSchema), user_controller_1.verifyAccountController);
router.post('/resend-otp', (0, validation_middleware_1.validationMiddleware)(user_validation_1.resendOTPSchema), user_controller_1.resendOTPController);
router.post('/forgot-password', (0, validation_middleware_1.validationMiddleware)(user_validation_1.forgotPasswordSchema), user_controller_1.forgotPasswordController);
router.post('/verify-otp', (0, validation_middleware_1.validationMiddleware)(user_validation_1.resetPasswordSchema), user_controller_1.resetPasswordController);
router.post('/reset-password', (0, validation_middleware_1.validationMiddleware)(user_validation_1.resetPasswordsSchema), user_controller_1.actual_resetPasswordController);
router.post('/login', user_controller_1.loginController);
router.get('/logout', middlewares_1.authenticate, user_controller_1.logoutController);
router.patch('/update-password', middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(user_validation_1.updatePasswordSchema), user_controller_1.updatePasswordController);
router.get('/refresh-token', user_controller_1.refreshTokenController);
router.post('/unboarding', middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(user_validation_1.onboardingSchema), user_controller_1.unboardingController);
router.post("/change-password", middlewares_1.authenticate, user_controller_1.changePasswordController);
router.route('/')
    .patch(middlewares_1.authenticate, (0, validation_middleware_1.validationMiddleware)(user_validation_1.updateProfileSchema), exports.profileUpload, user_controller_1.updateProfileController)
    .get(middlewares_1.authenticate, user_controller_1.getProfileController);
router.patch("/:id", middlewares_1.authenticate, user_controller_1.updateAdminProfileController);
exports.default = { router, path: '/user' };

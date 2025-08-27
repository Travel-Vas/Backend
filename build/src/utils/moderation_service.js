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
exports.ContentModerationService = void 0;
const vision_1 = require("@google-cloud/vision");
const suspension_model_1 = require("../resources/users/suspension.model");
const user_model_1 = __importDefault(require("../resources/users/user.model"));
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
class ContentModerationService {
    constructor() {
        this.vision = new vision_1.ImageAnnotatorClient({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
        });
    }
    // Main moderation function using Google Vision
    moderateImage(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [result] = yield this.vision.safeSearchDetection({
                    image: { source: { filename: filePath } }
                });
                const safeSearch = result.safeSearchAnnotation;
                // Check for inappropriate content
                const adultConfidence = this.convertLikelihoodToConfidence(safeSearch.adult);
                const racyConfidence = this.convertLikelihoodToConfidence(safeSearch.racy);
                // Determine if content is inappropriate
                const isInappropriate = safeSearch.adult === 'LIKELY' ||
                    safeSearch.adult === 'VERY_LIKELY' ||
                    safeSearch.racy === 'VERY_LIKELY';
                // Use the higher confidence score
                const maxConfidence = Math.max(adultConfidence, racyConfidence);
                return {
                    isInappropriate,
                    confidence: maxConfidence,
                    details: {
                        adult: safeSearch.adult,
                        racy: safeSearch.racy,
                        violence: safeSearch.violence,
                        spoof: safeSearch.spoof,
                        medical: safeSearch.medical
                    },
                    service: 'Google Vision'
                };
            }
            catch (error) {
                console.error('Google Vision moderation error:', error);
                // Return safe result if service fails
                return {
                    isInappropriate: false,
                    confidence: 0,
                    error: 'Moderation service unavailable',
                    service: 'Google Vision (Failed)'
                };
            }
        });
    }
    // Convert Google Vision likelihood to confidence percentage
    convertLikelihoodToConfidence(likelihood) {
        const likelihoodMap = {
            'VERY_UNLIKELY': 5,
            'UNLIKELY': 20,
            'POSSIBLE': 50,
            'LIKELY': 80,
            'VERY_LIKELY': 95
        };
        return likelihoodMap[likelihood] || 0;
    }
    suspendUser(userId, reason, un_suspend, resolution_text) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDetials = yield user_model_1.default.findOne({
                _id: userId
            }).lean().exec();
            if (!userDetials) {
                throw new App_1.CustomError({
                    message: "Record not found",
                    code: http_status_codes_1.StatusCodes.NOT_FOUND
                });
            }
            try {
                if (un_suspend) {
                    console.log("un suspend");
                    const response = yield user_model_1.default.findByIdAndUpdate(userId, {
                        isSuspended: false,
                        suspendedAt: new Date(),
                        suspensionReason: reason
                    }, {
                        new: true
                    });
                    yield suspension_model_1.SuspensionModel.findOneAndUpdate({ userId, isActive: true }, {
                        isActive: false,
                        unsuspendedAt: new Date(),
                        unsuspensionReason: reason,
                        resolvedBy: 'admin' // or pass admin ID if available
                    });
                    const gallery_url = "https://www.fotolocker.io/client-sign-in";
                    yield new App_1.EmailService().accountActivationMail("Account Activation", userDetials === null || userDetials === void 0 ? void 0 : userDetials.email, userDetials === null || userDetials === void 0 ? void 0 : userDetials.business_name, resolution_text);
                    console.log(`User ${userId} suspended for: ${reason}`);
                    return userDetials;
                }
                else {
                    const response = yield user_model_1.default.findByIdAndUpdate(userId, {
                        isSuspended: true,
                        suspendedAt: new Date(),
                        suspensionReason: reason
                    });
                    // Create suspension record
                    const suspensionData = new suspension_model_1.SuspensionModel({
                        userId,
                        reason,
                        suspensionType: 'automatic',
                        reviewRequired: true
                    });
                    yield suspensionData.save();
                    // Send notification email (implement based on your email service)
                    const gallery_url = "https://www.fotolocker.io/client-sign-in";
                    yield new App_1.EmailService().suspensionMail("Suspension", userDetials === null || userDetials === void 0 ? void 0 : userDetials.email, userDetials === null || userDetials === void 0 ? void 0 : userDetials.business_name, reason, gallery_url);
                    console.log(`User ${userId} suspended for: ${reason}`);
                    return suspensionData;
                }
            }
            catch (error) {
                console.error('Failed to suspend user:', error);
                throw error;
            }
        });
    }
}
exports.ContentModerationService = ContentModerationService;

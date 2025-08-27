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
exports.subscription_checker = void 0;
const subscription_model_1 = __importDefault(require("../resources/subscription/subscription.model"));
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const shoots_model_1 = require("../resources/photoshoots/shoots.model");
/**
 * Checks if uploading files would exceed the user's subscription limits
 * Handles storage limits like "50GB dedicated cloud storage" and file size limits
 *
 * @param files Array of files being uploaded
 * @param userId User ID to check subscription for
 * @returns true if all checks pass
 * @throws CustomError if any limits would be exceeded
 */
// export const subscription_checker = async (files: any[], userId: any) => {
//     // Fetch user's subscription details
//     const subscription: any = await subscriptionModel.findOne({
//         userId: userId
//     }).populate("pricingId").lean().exec();
//
//     if (!subscription || !subscription.pricingId) {
//         throw new CustomError({
//             message: "No active subscription found",
//             code: StatusCodes.BAD_REQUEST
//         });
//     }
//
//     // Extract features from either pricingId or directly from subscription
//     const features = subscription?.pricingId?.features || subscription.features;
//
//     if (!features) {
//         throw new CustomError({
//             message: "Subscription features not found",
//             code: StatusCodes.INTERNAL_SERVER_ERROR
//         });
//     }
//
//     // Parse file size limit - handle formats like "5MB Max" or just "5MB"
//     const extractSizeLimit = (sizeString: string): { value: number, unit: string } => {
//         // Regular expression to find size value and unit in various formats
//         const matches = sizeString?.match(/(\d+)\s*([KMG]B)/i);
//
//         if (!matches) {
//             throw new CustomError({
//                 message: `Invalid size format: ${sizeString}`,
//                 code: StatusCodes.INTERNAL_SERVER_ERROR
//             });
//         }
//
//         return {
//             value: parseInt(matches[1]),
//             unit: matches[2].toUpperCase()
//         };
//     };
//
//     // Convert size to KB based on unit
//     const convertToKB = (value: number, unit: string): number => {
//         switch(unit) {
//             case 'KB': return value;
//             case 'MB': return value * 1024;
//             case 'GB': return value * 1024 * 1024;
//             default:
//                 throw new CustomError({
//                     message: `Unsupported size unit: ${unit}`,
//                     code: StatusCodes.INTERNAL_SERVER_ERROR
//                 });
//         }
//     };
//
//     // Extract and parse file size limit
//     // Default to 10MB if file_size is not specified in features
//     const fileSizeLimit = features?.file_size;
//     const fileSizeInfo = extractSizeLimit(fileSizeLimit);
//     const limitInKB = convertToKB(fileSizeInfo.value, fileSizeInfo.unit);
//     console.log(`Max file size allowed (KB): ${limitInKB}`);
//
//     // Calculate total size of new files being uploaded
//     let newFilesTotalSizeKB = 0;
//
//     // Check each uploaded file
//     for (const file of files) {
//         if (!file || typeof file.size !== 'number') {
//             throw new CustomError({
//                 message: "Invalid file upload data",
//                 code: StatusCodes.BAD_REQUEST
//             });
//         }
//
//         const uploadedFileSizeKB = file.size / 1024; // file.size is in bytes
//         console.log(`Uploaded file size (KB): ${uploadedFileSizeKB}`);
//
//         // Add to new files total
//         newFilesTotalSizeKB += uploadedFileSizeKB;
//
//         // Check individual file size limit
//         if (uploadedFileSizeKB > limitInKB) {
//             console.log(`File ${file.originalname || 'unnamed'} exceeds limit!`);
//             throw new CustomError({
//                 message: "Your file size is too large for your current plan",
//                 code: StatusCodes.BAD_REQUEST
//             });
//         }
//     }
//
//     console.log(`New files total size (KB): ${newFilesTotalSizeKB}`);
//
//     // Calculate total storage used by this user
//     const shootsDetails = await ShootsModel.find({
//         user_id: userId
//     }).lean().exec();
//
//     let totalStorageUsedKB = 0;
//
//     for (const shoot of shootsDetails) {
//         if (Array.isArray(shoot.files)) {
//             for (const file of shoot.files) {
//                 if (file?.size) {
//                     try {
//                         // Make sure we're dealing with bytes - handle both number and string types
//                         const fileSizeBytes = typeof file.size === 'number' ?
//                             file.size :
//                             parseFloat(file.size); // Use parseFloat instead of parseInt to handle decimal values
//
//                         if (!isNaN(fileSizeBytes)) {
//                             totalStorageUsedKB += fileSizeBytes / 1024; // convert bytes to KB
//                         } else {
//                             console.warn(`Warning: Invalid file size encountered: ${file.size}`);
//                         }
//                     } catch (error:any) {
//                         console.warn(`Error processing file size: ${error.message}`);
//                         // Continue processing other files rather than failing
//                     }
//                 }
//             }
//         }
//     }
//
//     console.log(`Current storage used (KB): ${totalStorageUsedKB}`);
//
//     // Extract storage limit from features, handling descriptive text like "50GB dedicated cloud storage"
//     const storageString = features.storageSize ? features.storageSize : features.storage;
//     // Find first instance of size pattern - handle formats like "50GB" or "50 GB dedicated cloud storage"
//     const storageMatches = storageString?.match(/(\d+)\s*([KMG]B)/i);
//
//     if (!storageMatches) {
//         console.error(`Failed to parse storage string: "${storageString}"`);
//         throw new CustomError({
//             message: `Invalid storage limit format: ${storageString}`,
//             code: StatusCodes.INTERNAL_SERVER_ERROR
//         });
//     }
//
//     const storageValue = parseInt(storageMatches[1]);
//     const storageUnit = storageMatches[2].toUpperCase();
//
//     console.log(`Parsed storage limit: ${storageValue}${storageUnit} from "${storageString}"`); // Debug
//     const allowedStorageKB = convertToKB(storageValue, storageUnit);
//
//     console.log(`Total storage limit (KB): ${allowedStorageKB}`);
//
//     // Check if adding new files would exceed storage limit
//     // Apply a small buffer to handle floating point precision issues
//     const BUFFER_KB = 1; // 1KB buffer to handle floating point precision issues
//     const totalAfterUpload = totalStorageUsedKB + newFilesTotalSizeKB;
//     console.log(`Total after upload (KB): ${totalAfterUpload}`);
//
//     // Apply a more forgiving comparison with a small buffer
//     if (totalAfterUpload > (allowedStorageKB + BUFFER_KB)) {
//         console.log(`Exceeding storage limit! Used + New (KB): ${totalAfterUpload}, Limit (KB): ${allowedStorageKB}`);
//
//         // Calculate remaining space for better error message
//         const remainingSpaceKB = Math.max(0, allowedStorageKB - totalStorageUsedKB);
//         const remainingSpaceMB = (remainingSpaceKB / 1024).toFixed(2);
//
//         throw new CustomError({
//             message: `You have ${remainingSpaceMB}MB of storage left. Adding these files would exceed your storage limit. Please free up space or upgrade your plan.`,
//             code: StatusCodes.BAD_REQUEST
//         });
//     }
//
//     // Print more detailed debug info
//     const usedPercentage = ((totalStorageUsedKB / allowedStorageKB) * 100).toFixed(2);
//     const newFilesPercentage = ((newFilesTotalSizeKB / allowedStorageKB) * 100).toFixed(2);
//     const totalPercentage = ((totalAfterUpload / allowedStorageKB) * 100).toFixed(2);
//
//     console.log(`
//         Storage check details:
//         - Currently used: ${totalStorageUsedKB.toFixed(2)}KB (${usedPercentage}%)
//         - New files: ${newFilesTotalSizeKB.toFixed(2)}KB (${newFilesPercentage}%)
//         - Total after upload: ${totalAfterUpload.toFixed(2)}KB (${totalPercentage}%)
//         - Available: ${(allowedStorageKB - totalStorageUsedKB).toFixed(2)}KB (${(100 - parseFloat(usedPercentage)).toFixed(2)}%)
//     `);
//
//     // All checks passed
//     return true;
// };
const subscription_checker = (files, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Fetch user's subscription details
    const subscription = yield subscription_model_1.default.findOne({
        userId: userId
    }).populate("pricingId").lean().exec();
    if (!subscription || !subscription.pricingId) {
        throw new App_1.CustomError({
            message: "No active subscription found",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // Extract features from either pricingId or directly from subscription
    const features = ((_a = subscription === null || subscription === void 0 ? void 0 : subscription.pricingId) === null || _a === void 0 ? void 0 : _a.features) || subscription.features;
    if (!features) {
        throw new App_1.CustomError({
            message: "Subscription features not found",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
    // Parse file size limit - handle formats like "5MB Max" or just "5MB"
    const extractSizeLimit = (sizeString) => {
        if (!sizeString) {
            throw new App_1.CustomError({
                message: "Size limit not specified in subscription features",
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
        // Regular expression to find size value and unit in various formats
        const matches = sizeString.match(/(\d+)\s*([KMG]B)/i);
        if (!matches) {
            throw new App_1.CustomError({
                message: `Invalid size format: ${sizeString}`,
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
        return {
            value: parseInt(matches[1]),
            unit: matches[2].toUpperCase()
        };
    };
    // Convert size to KB based on unit
    const convertToKB = (value, unit) => {
        switch (unit) {
            case 'KB': return value;
            case 'MB': return value * 1024;
            case 'GB': return value * 1024 * 1024;
            default:
                throw new App_1.CustomError({
                    message: `Unsupported size unit: ${unit}`,
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
        }
    };
    // Extract and parse file size limit
    const fileSizeLimit = features === null || features === void 0 ? void 0 : features.file_size;
    if (!fileSizeLimit) {
        throw new App_1.CustomError({
            message: "File size limit not found in subscription features",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const fileSizeInfo = extractSizeLimit(fileSizeLimit);
    const limitInKB = convertToKB(fileSizeInfo.value, fileSizeInfo.unit);
    console.log(`Max file size allowed: ${fileSizeInfo.value}${fileSizeInfo.unit} (${limitInKB}KB)`);
    // Calculate total size of new files being uploaded
    let newFilesTotalSizeKB = 0;
    // Check each uploaded file
    for (const file of files) {
        if (!file || typeof file.size !== 'number') {
            throw new App_1.CustomError({
                message: "Invalid file upload data",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const uploadedFileSizeKB = file.size / 1024; // file.size is in bytes
        console.log(`File "${file.originalname || 'unnamed'}" size: ${(file.size / (1024 * 1024)).toFixed(2)}MB (${uploadedFileSizeKB.toFixed(2)}KB)`);
        // Add to new files total
        newFilesTotalSizeKB += uploadedFileSizeKB;
        // Check individual file size limit
        if (uploadedFileSizeKB > limitInKB) {
            const fileSizeMB = (uploadedFileSizeKB / 1024).toFixed(2);
            const limitMB = (limitInKB / 1024).toFixed(2);
            console.log(`File ${file.originalname || 'unnamed'} (${fileSizeMB}MB) exceeds limit of ${limitMB}MB!`);
            throw new App_1.CustomError({
                message: `File "${file.originalname || 'unnamed'}" (${fileSizeMB}MB) exceeds the ${limitMB}MB file size limit for your current plan`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
    }
    console.log(`New files total size: ${(newFilesTotalSizeKB / 1024).toFixed(2)}MB (${newFilesTotalSizeKB.toFixed(2)}KB)`);
    // Calculate total storage used by this user
    const shootsDetails = yield shoots_model_1.ShootsModel.find({
        user_id: userId
    }).lean().exec();
    let totalStorageUsedKB = 0;
    for (const shoot of shootsDetails) {
        if (Array.isArray(shoot.files)) {
            for (const file of shoot.files) {
                if (file === null || file === void 0 ? void 0 : file.size) {
                    try {
                        // Make sure we're dealing with bytes - handle both number and string types
                        const fileSizeBytes = typeof file.size === 'number' ?
                            file.size :
                            parseFloat(file.size);
                        if (!isNaN(fileSizeBytes) && fileSizeBytes > 0) {
                            totalStorageUsedKB += fileSizeBytes / 1024; // convert bytes to KB
                        }
                        else {
                            console.warn(`Warning: Invalid file size encountered: ${file.size}`);
                        }
                    }
                    catch (error) {
                        console.warn(`Error processing file size: ${error.message}`);
                        // Continue processing other files rather than failing
                    }
                }
            }
        }
    }
    console.log(`Current storage used: ${(totalStorageUsedKB / 1024).toFixed(2)}MB (${totalStorageUsedKB.toFixed(2)}KB)`);
    // Extract storage limit from features
    const storageString = features.storageSize || features.storage;
    if (!storageString) {
        throw new App_1.CustomError({
            message: "Storage limit not found in subscription features",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
    // Find first instance of size pattern - handle formats like "50GB" or "50 GB dedicated cloud storage"
    const storageMatches = storageString.match(/(\d+)\s*([KMG]B)/i);
    if (!storageMatches) {
        console.error(`Failed to parse storage string: "${storageString}"`);
        throw new App_1.CustomError({
            message: `Invalid storage limit format: ${storageString}`,
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
    const storageValue = parseInt(storageMatches[1]);
    const storageUnit = storageMatches[2].toUpperCase();
    const allowedStorageKB = convertToKB(storageValue, storageUnit);
    console.log(`Storage limit: ${storageValue}${storageUnit} (${allowedStorageKB}KB) from "${storageString}"`);
    // Check if adding new files would exceed storage limit
    const totalAfterUpload = totalStorageUsedKB + newFilesTotalSizeKB;
    console.log(`Total after upload: ${(totalAfterUpload / 1024).toFixed(2)}MB (${totalAfterUpload.toFixed(2)}KB)`);
    // Use a small buffer to handle floating point precision issues
    const BUFFER_KB = 10; // 10KB buffer to handle floating point precision issues
    if (totalAfterUpload > (allowedStorageKB + BUFFER_KB)) {
        console.log(`Storage limit exceeded!`);
        console.log(`- Current usage: ${(totalStorageUsedKB / 1024).toFixed(2)}MB`);
        console.log(`- New files: ${(newFilesTotalSizeKB / 1024).toFixed(2)}MB`);
        console.log(`- Total needed: ${(totalAfterUpload / 1024).toFixed(2)}MB`);
        console.log(`- Storage limit: ${(allowedStorageKB / 1024).toFixed(2)}MB`);
        // Calculate remaining space for better error message
        const remainingSpaceKB = Math.max(0, allowedStorageKB - totalStorageUsedKB);
        const remainingSpaceMB = (remainingSpaceKB / 1024).toFixed(2);
        const neededSpaceMB = (newFilesTotalSizeKB / 1024).toFixed(2);
        throw new App_1.CustomError({
            message: `Storage limit exceeded. You have ${remainingSpaceMB}MB remaining, but need ${neededSpaceMB}MB for these files. Please free up space or upgrade your plan.`,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // Print detailed storage summary
    const usedPercentage = ((totalStorageUsedKB / allowedStorageKB) * 100).toFixed(1);
    const totalPercentage = ((totalAfterUpload / allowedStorageKB) * 100).toFixed(1);
    const availableAfterUpload = allowedStorageKB - totalAfterUpload;
    console.log(`
Storage Summary:
- Plan: ${storageValue}${storageUnit} (${(allowedStorageKB / 1024).toFixed(2)}MB)
- Currently used: ${(totalStorageUsedKB / 1024).toFixed(2)}MB (${usedPercentage}%)
- New files: ${(newFilesTotalSizeKB / 1024).toFixed(2)}MB
- After upload: ${(totalAfterUpload / 1024).toFixed(2)}MB (${totalPercentage}%)
- Remaining: ${(availableAfterUpload / 1024).toFixed(2)}MB
    `);
    // All checks passed
    return true;
});
exports.subscription_checker = subscription_checker;

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
exports.compressImageToTarget = void 0;
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("node:fs/promises"));
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const compressImageToTarget = (inputPath_1, outputPath_1, ...args_1) => __awaiter(void 0, [inputPath_1, outputPath_1, ...args_1], void 0, function* (inputPath, outputPath, targetSizeBytes = 10 * 1024 * 1024) {
    let quality = 95;
    let compressed = false;
    while (quality >= 10 && !compressed) {
        try {
            // Get image metadata first
            const imageInfo = yield (0, sharp_1.default)(inputPath).metadata();
            let sharpInstance = (0, sharp_1.default)(inputPath);
            // Remove EXIF data but maintain original orientation
            // rotate(0) removes EXIF rotation data while keeping the image as-is
            sharpInstance = sharpInstance.rotate(0);
            // Apply compression based on file type
            if (imageInfo.format === 'jpeg' || imageInfo.format === 'jpg') {
                yield sharpInstance
                    .jpeg({
                    quality: quality,
                    progressive: true,
                    mozjpeg: true
                })
                    .toFile(outputPath);
            }
            else if (imageInfo.format === 'png') {
                yield sharpInstance
                    .png({
                    quality: quality,
                    compressionLevel: 9,
                    progressive: true
                })
                    .toFile(outputPath);
            }
            else if (imageInfo.format === 'webp') {
                yield sharpInstance
                    .webp({
                    quality: quality
                })
                    .toFile(outputPath);
            }
            else {
                // Convert other formats to JPEG for better compression
                yield sharpInstance
                    .jpeg({
                    quality: quality,
                    progressive: true,
                    mozjpeg: true
                })
                    .toFile(outputPath);
            }
            // Check file size
            const stats = yield promises_1.default.stat(outputPath);
            if (stats.size <= targetSizeBytes) {
                compressed = true;
            }
            else {
                // Delete the file and try with lower quality
                yield promises_1.default.unlink(outputPath).catch(() => { });
                quality -= 10;
            }
        }
        catch (error) {
            console.error(`Error compressing image at quality ${quality}:`, error);
            quality -= 10;
        }
    }
    if (!compressed) {
        // If still not compressed enough, try more aggressive compression with resizing
        try {
            const imageInfo = yield (0, sharp_1.default)(inputPath).metadata();
            let sharpInstance = (0, sharp_1.default)(inputPath);
            // Remove EXIF data but maintain original orientation
            sharpInstance = sharpInstance.rotate(0);
            // Determine max dimensions based on original orientation
            const isPortrait = (imageInfo.height || 0) > (imageInfo.width || 0);
            const isLandscape = (imageInfo.width || 0) > (imageInfo.height || 0);
            let resizeOptions = {
                fit: 'inside',
                withoutEnlargement: true
            };
            if (isPortrait) {
                // For portrait images, limit height more than width
                resizeOptions.width = 3000;
                resizeOptions.height = 4000;
            }
            else if (isLandscape) {
                // For landscape images, limit width more than height
                resizeOptions.width = 4000;
                resizeOptions.height = 3000;
            }
            else {
                // For square images
                resizeOptions.width = 3500;
                resizeOptions.height = 3500;
            }
            // Resize if necessary and apply maximum compression
            yield sharpInstance
                .resize(resizeOptions)
                .jpeg({
                quality: 70,
                progressive: true,
                mozjpeg: true
            })
                .toFile(outputPath);
        }
        catch (error) {
            console.error('Final compression attempt failed:', error);
            throw new App_1.CustomError({
                message: 'Unable to compress image to required size',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
    }
});
exports.compressImageToTarget = compressImageToTarget;

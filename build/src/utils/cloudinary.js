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
exports.uploadFilePathToCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_setup_1 = __importDefault(require("./cloudinary_setup"));
const streamifier_1 = __importDefault(require("streamifier"));
const fs_1 = __importDefault(require("fs"));
/**
 * Uploads a buffer to Cloudinary with improved memory management
 * @param buffer - Buffer to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        // Create stream directly from buffer to avoid duplicate memory allocation
        const uploadStream = cloudinary_setup_1.default.uploader.upload_stream({
            folder: folder ? folder : "travelvas",
            format: 'webp'
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                // Explicitly null the buffer reference to help garbage collection
                // @ts-ignore
                buffer = null;
                resolve(result);
            }
        });
        // Create readable stream from buffer
        const readableStream = streamifier_1.default.createReadStream(buffer);
        // Handle potential stream errors
        readableStream.on("error", (err) => {
            reject(err);
        });
        // Handle upload stream errors
        uploadStream.on("error", (err) => {
            reject(err);
        });
        // Pipe with proper error handling
        readableStream.pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Uploads a file to Cloudinary directly from a file path
 * @param filePath - Path to the file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with Cloudinary upload result
 */
const uploadFilePathToCloudinary = (filePath, folder, options) => {
    return new Promise((resolve, reject) => {
        // Create upload stream from Cloudinary
        const uploadStream = cloudinary_setup_1.default.uploader.upload_stream(options ? Object.assign({}, options) : {
            folder: folder ? folder : "foto-locker",
            resource_type: 'image',
            format: `${folder === 'edited_photos' ? 'jpg' : 'webp'}`,
            angle: "auto"
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        // Create read stream from file path
        const fileStream = fs_1.default.createReadStream(filePath);
        // Handle read stream errors
        fileStream.on('error', (error) => {
            uploadStream.destroy();
            reject(error);
        });
        // Handle upload stream errors
        uploadStream.on("error", (err) => {
            uploadStream.destroy();
            reject(err);
        });
        // Pipe file stream to upload stream
        fileStream.pipe(uploadStream);
    });
};
exports.uploadFilePathToCloudinary = uploadFilePathToCloudinary;
function uploadStreamToCloudinary(fileStream) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_setup_1.default.uploader.upload_stream({ resource_type: 'auto', format: 'webp', angle: "exif" }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            fileStream.pipe(uploadStream);
            fileStream.on('error', (error) => {
                uploadStream.destroy();
                reject(error);
            });
        });
    });
}
exports.default = uploadStreamToCloudinary;

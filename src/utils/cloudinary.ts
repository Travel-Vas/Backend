import cloudinary_setup from "./cloudinary_setup";
import streamifier from "streamifier";
import fs from "fs";

/**
 * Uploads a buffer to Cloudinary with improved memory management
 * @param buffer - Buffer to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with Cloudinary upload result
 */
export const uploadToCloudinary = (buffer: Buffer, folder?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Create stream directly from buffer to avoid duplicate memory allocation
        const uploadStream = cloudinary_setup.uploader.upload_stream(
            {
                folder: folder ? folder : "travelvas",
                format: 'webp'
            },
            (error: any, result: any) => {
                if (error) {
                    reject(error);
                } else {
                    // Explicitly null the buffer reference to help garbage collection
                    // @ts-ignore
                    buffer = null;
                    resolve(result);
                }
            }
        );

        // Create readable stream from buffer
        const readableStream = streamifier.createReadStream(buffer);

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

/**
 * Uploads a file to Cloudinary directly from a file path
 * @param filePath - Path to the file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with Cloudinary upload result
 */
export const uploadFilePathToCloudinary = (filePath: string, folder?: string, options?:any): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Create upload stream from Cloudinary
        const uploadStream = cloudinary_setup.uploader.upload_stream(
            options ? {...options} : {
                folder: folder ? folder : "foto-locker",
                resource_type: 'image',
                format: `${folder === 'edited_photos'?'jpg':'webp'}`,
                angle: "auto"
            },
            (error: any, result: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        // Create read stream from file path
        const fileStream = fs.createReadStream(filePath);

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

async function uploadStreamToCloudinary(fileStream: any) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_setup.uploader.upload_stream(
            { resource_type: 'auto', format: 'webp',angle: "exif" },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        fileStream.pipe(uploadStream);

        fileStream.on('error', (error: any) => {
            uploadStream.destroy();
            reject(error);
        });
    });
}
export default uploadStreamToCloudinary
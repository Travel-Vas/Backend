import sharp from "sharp";
import fs from "node:fs/promises";
import {CustomError} from "../helpers/lib/App";
import {StatusCodes} from "http-status-codes";

export const compressImageToTarget = async (inputPath: string, outputPath: string, targetSizeBytes: number = 10 * 1024 * 1024): Promise<void> => {
    let quality = 95;
    let compressed = false;

    while (quality >= 10 && !compressed) {
        try {
            // Get image metadata first
            const imageInfo = await sharp(inputPath).metadata();

            let sharpInstance = sharp(inputPath);

            // Remove EXIF data but maintain original orientation
            // rotate(0) removes EXIF rotation data while keeping the image as-is
            sharpInstance = sharpInstance.rotate(0);

            // Apply compression based on file type
            if (imageInfo.format === 'jpeg' || imageInfo.format === 'jpg') {
                await sharpInstance
                    .jpeg({
                        quality: quality,
                        progressive: true,
                        mozjpeg: true
                    })
                    .toFile(outputPath);
            } else if (imageInfo.format === 'png') {
                await sharpInstance
                    .png({
                        quality: quality,
                        compressionLevel: 9,
                        progressive: true
                    })
                    .toFile(outputPath);
            } else if (imageInfo.format === 'webp') {
                await sharpInstance
                    .webp({
                        quality: quality
                    })
                    .toFile(outputPath);
            } else {
                // Convert other formats to JPEG for better compression
                await sharpInstance
                    .jpeg({
                        quality: quality,
                        progressive: true,
                        mozjpeg: true
                    })
                    .toFile(outputPath);
            }

            // Check file size
            const stats = await fs.stat(outputPath);
            if (stats.size <= targetSizeBytes) {
                compressed = true;
            } else {
                // Delete the file and try with lower quality
                await fs.unlink(outputPath).catch(() => {});
                quality -= 10;
            }
        } catch (error) {
            console.error(`Error compressing image at quality ${quality}:`, error);
            quality -= 10;
        }
    }

    if (!compressed) {
        // If still not compressed enough, try more aggressive compression with resizing
        try {
            const imageInfo = await sharp(inputPath).metadata();

            let sharpInstance = sharp(inputPath);

            // Remove EXIF data but maintain original orientation
            sharpInstance = sharpInstance.rotate(0);

            // Determine max dimensions based on original orientation
            const isPortrait = (imageInfo.height || 0) > (imageInfo.width || 0);
            const isLandscape = (imageInfo.width || 0) > (imageInfo.height || 0);

            let resizeOptions: any = {
                fit: 'inside',
                withoutEnlargement: true
            };

            if (isPortrait) {
                // For portrait images, limit height more than width
                resizeOptions.width = 3000;
                resizeOptions.height = 4000;
            } else if (isLandscape) {
                // For landscape images, limit width more than height
                resizeOptions.width = 4000;
                resizeOptions.height = 3000;
            } else {
                // For square images
                resizeOptions.width = 3500;
                resizeOptions.height = 3500;
            }

            // Resize if necessary and apply maximum compression
            await sharpInstance
                .resize(resizeOptions)
                .jpeg({
                    quality: 70,
                    progressive: true,
                    mozjpeg: true
                })
                .toFile(outputPath);
        } catch (error) {
            console.error('Final compression attempt failed:', error);
            throw new CustomError({
                message: 'Unable to compress image to required size',
                code: StatusCodes.BAD_REQUEST
            });
        }
    }
};
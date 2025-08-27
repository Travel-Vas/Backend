import { Storage, Bucket, File } from "@google-cloud/storage";
import fs from 'fs';
import path from "path";
import { Readable } from 'stream';

interface UploadResult {
    file?: File;
    publicUrl?: string;
    fileName: string;
    secure_url?: string;
    bucketName?: string;
}

class GoogleCloudStorage {
    private storage: Storage; // Use private for internal properties
    private defaultBucket: Bucket;

    constructor() {
        let serviceAccountKey: any;
        const encodedKey = process.env.GCP_SERVICE_ACCOUNT_KEY_BASE64;
        if (!encodedKey) throw new Error("Base64 key not set.");
        const serviceAccountKeyJson = Buffer.from(encodedKey, 'base64').toString('utf8');
        serviceAccountKey = JSON.parse(serviceAccountKeyJson);

        this.storage = new Storage({
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            credentials: serviceAccountKey, // Pass the parsed JSON object
        });

        // Ensure bucket name is provided via environment variables
        const bucketName = process.env.GC_BUCKET_NAME;
        if (!bucketName) {
            throw new Error("GC_BUCKET_NAME environment variable is not set.");
        }
        this.defaultBucket = this.storage.bucket(bucketName);
    }

    private getBucket(bucketName?: string): Bucket {
        return bucketName ? this.storage.bucket(bucketName) : this.defaultBucket;
    }

    private async makeFilePublicAndGetUrl(file: File, bucketName: string): Promise<string> {
        try {
            await file.makePublic();
        } catch (error: any) {
            // Check for specific error related to uniform bucket-level access
            if (error.code === 400 && error.message.includes('uniform bucket-level access')) {
                console.warn(
                    `Bucket "${bucketName}" has uniform bucket-level access. ` +
                    `'makePublic()' is redundant if 'allUsers' has 'Storage Object Viewer' role on the bucket. ` +
                    `Ignoring attempt to set ACL on object.`
                );
            } else {
                throw error; // Re-throw other errors
            }
        }
        return `https://storage.googleapis.com/${bucketName}/${file.name}`;
    }


    /**
     * Uploads a file directly from a local file path.
     * Uses the optimized `bucket.upload()` method provided by @google-cloud/storage.
     * Ideal for files residing on the local filesystem.
     *
     * @param localFilePath The path to the file on the local filesystem.
     * @param destinationFileName The desired name of the file in GCS. If null, uses the local file's basename.
     * @param bucketName Optional: The name of the GCS bucket to upload to. Defaults to the one set in the constructor.
     * @returns Promise resolving to UploadResult.
     */
    async uploadFile(
        localFilePath: string,
        destinationFileName: string | null = null,
        bucketName?: string
    ): Promise<UploadResult> {
        try {
            const targetBucket = this.getBucket(bucketName);
            const fileName = destinationFileName || path.basename(localFilePath);

            // Use the built-in upload method for simplicity and optimization
            const [file] = await targetBucket.upload(localFilePath, {
                destination: fileName,
                metadata: {
                    cacheControl: 'public, max-age=31536000', // Cache for 1 year
                },
                // predefinedAcl: 'publicRead', // This often sets public access directly
            });

            const secure_url = await this.makeFilePublicAndGetUrl(file, targetBucket.name);

            console.log(`${localFilePath} uploaded to ${targetBucket.name}/${fileName}`);
            return {
                // file,
                secure_url,
                fileName,
                // bucketName: targetBucket.name
            };
            // return response
        } catch (error) {
            console.error('Error uploading file from path:', error);
            throw error;
        }
    }

    /**
     * Uploads a Buffer (in-memory data) directly to GCS.
     * Suitable for smaller files that are already loaded into memory (e.g., images after processing).
     *
     * @param buffer The Buffer containing the file data.
     * @param fileName The desired name of the file in GCS.
     * @param contentType The MIME type of the file.
     * @param bucketName Optional: The name of the GCS bucket to upload to. Defaults to the one set in the constructor.
     * @returns Promise resolving to UploadResult.
     */
    async uploadFromBuffer(
        buffer: Buffer | string | any,
        fileName: string,
        contentType = 'application/octet-stream',
        bucketName?: string
    ): Promise<UploadResult> {
        try {
            const targetBucket = this.getBucket(bucketName);
            const file = targetBucket.file(fileName);

            // Ensure we have a proper Buffer
            let bufferToUpload: Buffer;

            if (Buffer.isBuffer(buffer)) {
                bufferToUpload = buffer;
            } else if (typeof buffer === 'string') {
                // If it's a file path, read the file
                bufferToUpload = require('fs').readFileSync(buffer);
            } else {
                throw new Error(`Invalid buffer type: ${typeof buffer}. Expected Buffer or file path string.`);
            }

            await file.save(bufferToUpload, {
                metadata: {
                    contentType: contentType,
                    cacheControl: 'public, max-age=31536000',
                },
                // predefinedAcl: 'publicRead',
            });

            const publicUrl = await this.makeFilePublicAndGetUrl(file, targetBucket.name);

            console.log(`Buffer uploaded to ${targetBucket.name}/${fileName}`);
            console.log(`Public URL: ${publicUrl}`);

            return {
                file,
                publicUrl,
                fileName,
                bucketName: targetBucket.name
            };
        } catch (error) {
            console.error('Error uploading from buffer:', error);
            throw error;
        }
    }
    /**
     * Downloads a file from GCS to a specified local destination.
     *
     * @param fileName The name of the file in GCS.
     * @param localDestination The local path where the file should be saved.
     * @param bucketName Optional: The name of the GCS bucket to download from. Defaults to the one set in the constructor.
     * @returns Promise that resolves when the download is complete.
     */
    async downloadFile(
        fileName: string,
        localDestination: string,
        bucketName?: string
    ): Promise<void> {
        try {
            const targetBucket = this.getBucket(bucketName);
            await targetBucket.file(fileName).download({ destination: localDestination });
            console.log(`${fileName} downloaded to ${localDestination}`);
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    /**
     * Deletes a file from GCS.
     *
     * @param fileName The name of the file in GCS to delete.
     * @param bucketName Optional: The name of the GCS bucket. Defaults to the one set in the constructor.
     * @returns Promise that resolves when the file is deleted.
     */
    async deleteFile(
        fileName: string,
        bucketName?: string
    ): Promise<void> {
        try {
            const targetBucket = this.getBucket(bucketName);
            await targetBucket.file(fileName).delete();
            console.log(`${fileName} deleted from ${targetBucket.name}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Generates a signed URL for a private file, allowing temporary, time-limited access.
     * This is a more secure alternative to making files publicly readable.
     *
     * @param fileName The name of the file in GCS.
     * @param expiryInMinutes The duration in minutes for which the URL will be valid.
     * @param bucketName Optional: The name of the GCS bucket. Defaults to the one set in the constructor.
     * @returns Promise resolving to the signed URL string.
     */
    async generateSignedUrl(
        fileName: string,
        expiryInMinutes: number,
        bucketName?: string
    ): Promise<string> {
        try {
            const targetBucket = this.getBucket(bucketName);
            const file = targetBucket.file(fileName);

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiryInMinutes * 60 * 1000, // Expiry time in milliseconds
            });
            console.log(`Generated signed URL for ${fileName}: ${url}`);
            return url;
        } catch (error) {
            console.error('Error generating signed URL:', error);
            throw error;
        }
    }
}

export default GoogleCloudStorage;
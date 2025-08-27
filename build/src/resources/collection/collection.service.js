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
exports.updateCollectionService = exports.clientAccessCollectionService = exports.uploadMediaToCollectionService = exports.deleteCollectionService = exports.usersCollectionService = exports.getCollectionService = exports.collectionService = void 0;
const collection_model_1 = __importDefault(require("./collection.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("../../utils/cloudinary");
const promises_1 = __importDefault(require("node:fs/promises"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_cloud_1 = __importDefault(require("../../utils/google_cloud"));
const collectionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!payload.name || !payload.event_date) {
        throw new App_1.CustomError({
            message: 'Fields required: name and event_date',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // Check if collection already exists
    const collectionExist = yield collection_model_1.default.findOne({
        name: payload.name,
        user_id: payload.user_id,
    });
    if (collectionExist) {
        throw new App_1.CustomError({
            message: "Collection already exists",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const accessKey = `${(_a = payload.email) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/\s+/g, '')}-${randomNumber}`;
    const hashedAccessKey = yield bcryptjs_1.default.hash(accessKey, 10);
    // Handle the thumbnail file (it should be a single file, not an array)
    const thumbnailFile = payload === null || payload === void 0 ? void 0 : payload.thumbnail;
    const googleCloud = new google_cloud_1.default();
    // if (!thumbnailFile) {
    //     throw new CustomError({
    //         message: 'No valid thumbnail file provided',
    //         code: StatusCodes.BAD_REQUEST
    //     });
    // }
    // Use files from payload.files, not payload.media
    const files = payload.media;
    if (!files || !files.length) {
        throw new App_1.CustomError({
            message: "No files provided",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const newFiles = [];
    if (thumbnailFile) {
        try {
            // Process thumbnail
            const originalUpload = yield googleCloud.uploadFile(thumbnailFile.path, thumbnailFile.originalname);
            // const originalUpload = await uploadFilePathToCloudinary(thumbnailFile.path, "thumbnails");
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
                catch (_b) {
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
    // Process additional files
    for (const file of files) {
        try {
            // const originalUpload: any = await uploadFilePathToCloudinary(file.path);
            const originalUpload = yield googleCloud.uploadFile(file.path, file.originalname);
            let originalUrl = originalUpload.secure_url;
            newFiles.push({
                url: originalUrl,
                name: file.originalname,
                size: file.size,
                type: file.mimetype
            });
            // Clean up temp file immediately after processing
            yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
        }
        catch (error) {
            try {
                yield promises_1.default.unlink(file.path).catch(() => { });
            }
            catch (_c) { }
            console.error(`Error processing file ${file.originalname}: ${error}`);
            throw new App_1.CustomError({
                message: `Error processing file ${file.originalname}`,
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }
    const newPayload = Object.assign(Object.assign({}, payload), { media: newFiles, thumbnail: newFiles[0], hashedAccessKey: hashedAccessKey, accessKey: accessKey });
    const response = yield collection_model_1.default.create(newPayload);
    // send email to customer
    const gallery_url = "https://www.fotolocker.io/client-sign-in";
    yield new App_1.EmailService().clientEditedPhotosMail("New Collection Notification", payload === null || payload === void 0 ? void 0 : payload.email, payload.email, payload === null || payload === void 0 ? void 0 : payload.name, files.length, accessKey, gallery_url);
    return response;
});
exports.collectionService = collectionService;
const getCollectionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isValidObjectId = mongoose_1.default.Types.ObjectId.isValid(id);
        if (!isValidObjectId) {
            throw new App_1.CustomError({
                message: "Invalid collection ID",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const response = yield collection_model_1.default.findOne({
            _id: id,
            deleted_at: null,
        });
        return response;
    }
    catch (e) {
        console.error(e);
        throw new App_1.CustomError({
            message: "Error fetching collection",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.getCollectionService = getCollectionService;
const usersCollectionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield collection_model_1.default.find({
            user_id: id,
            deleted_at: null,
        }).sort({ created_at: -1 });
        return response;
    }
    catch (e) {
        throw new App_1.CustomError({
            message: "Error fetching users collections",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.usersCollectionService = usersCollectionService;
const deleteCollectionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = yield collection_model_1.default.findByIdAndDelete(id);
        return collection;
    }
    catch (e) {
        throw new App_1.CustomError({
            message: "Error deleting collection",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.deleteCollectionService = deleteCollectionService;
const uploadMediaToCollectionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const files = payload.media;
    if (!files || !files.length) {
        throw new App_1.CustomError({
            message: "No files provided",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const collectionDetails = yield collection_model_1.default.findOne({
        _id: payload.collectionId,
        user_id: payload.userId,
    });
    if (!collectionDetails) {
        throw new App_1.CustomError({
            message: "Collection not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    //     upload this to cloud and update collection
    const newFiles = [];
    for (const file of files) {
        try {
            const originalUpload = yield (0, cloudinary_1.uploadFilePathToCloudinary)(file.path);
            let originalUrl = originalUpload.secure_url;
            newFiles.push({
                url: originalUrl,
                name: file.originalname,
                size: file.size,
                type: file.mimetype
            });
            // Clean up temp file immediately after processing
            yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
        }
        catch (error) {
            try {
                yield promises_1.default.unlink(file.path).catch(() => { });
            }
            catch (_a) { }
            console.error(`Error processing file ${file.originalname}: ${error}`);
            throw new App_1.CustomError({
                message: `Error processing file ${file.originalname}`,
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }
    const result = yield collection_model_1.default.findOneAndUpdate({ _id: payload.collectionId }, {
        $push: {
            media: newFiles,
        }
    }, { new: true });
    return result;
});
exports.uploadMediaToCollectionService = uploadMediaToCollectionService;
const clientAccessCollectionService = (access_key) => __awaiter(void 0, void 0, void 0, function* () {
    const [email, nums] = access_key.split("-");
    const collectionDetails = yield collection_model_1.default.findOne({
        email: email,
    }).lean().exec();
    if (!collectionDetails) {
        throw new App_1.CustomError({
            message: "Collection not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    const validatedKey = yield bcryptjs_1.default.compare(access_key, collectionDetails.hashedAccessKey);
    if (!validatedKey) {
        throw new App_1.CustomError({
            message: "Invalid access key",
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    }
    return {
        id: collectionDetails._id, name: collectionDetails.name, thumbnail: collectionDetails.thumbnail, email: collectionDetails.email, phone: collectionDetails.phone, media: collectionDetails.media
    };
});
exports.clientAccessCollectionService = clientAccessCollectionService;
const updateCollectionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const existingCollection = yield collection_model_1.default.findById(payload.collectionId);
    if (!existingCollection) {
        throw new App_1.CustomError({
            message: "Collection does not exist",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    const googleCloud = new google_cloud_1.default();
    // Handle thumbnail upload if provided
    if (payload.thumbnail) {
        const thumbFile = payload.thumbnail;
        // Upload thumbnail to Cloudinary
        // const thumbResult = await uploadFilePathToCloudinary(thumbFile.path);
        const thumbResult = yield googleCloud.uploadFile(thumbFile.path, thumbFile.originalname);
        payload.body.thumbnail = [{
                url: thumbResult.secure_url,
                name: thumbFile.originalname,
                size: thumbFile.size,
                type: thumbFile.mimetype
            }];
    }
    // Handle media updates
    if (payload.body.media) {
        const mediaData = payload.body.media;
        let finalMediaArray = [];
        let thumbnailUpdateNeeded = false;
        let newThumbnailData = null;
        // Start with existing media as the base
        const existingMedia = existingCollection.media || [];
        // Get current thumbnail ID for comparison
        const currentThumbnailId = ((_b = (_a = existingCollection.thumbnail) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.url) ?
            (_d = (_c = existingMedia.find((media) => media.url === existingCollection.thumbnail[0].url)) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString() : null;
        // Handle prev_files logic - remove files that should be replaced/deleted
        if (mediaData.prev_files && Array.isArray(mediaData.prev_files) && mediaData.prev_files.length > 0) {
            // Check if thumbnail image is being replaced
            if (currentThumbnailId && mediaData.prev_files.includes(currentThumbnailId)) {
                console.log('Thumbnail image is being replaced, will need to update thumbnail reference');
                thumbnailUpdateNeeded = true;
            }
            // Keep files whose IDs are NOT in prev_files (remove the ones that are in prev_files)
            finalMediaArray = existingMedia.filter((media) => {
                const mediaId = media._id.toString();
                const shouldRemove = mediaData.prev_files.some((prevId) => prevId === mediaId || prevId === media._id.toString());
                console.log(`Media ID: ${mediaId}, Should remove: ${shouldRemove}`);
                return !shouldRemove;
            }).map((media) => ({
                url: media.url,
                name: media.name,
                size: media.size,
                type: media.type,
                _id: media._id
            }));
            console.log('Remaining files after removal:', finalMediaArray.length);
        }
        else {
            // If no prev_files specified, keep all existing files
            finalMediaArray = existingMedia.map((media) => ({
                url: media.url,
                name: media.name,
                size: media.size,
                type: media.type,
                _id: media._id
            }));
            console.log('No files to remove, keeping all existing files:', finalMediaArray.length);
        }
        // Handle new file uploads - ONLY use payload.media (actual uploaded files)
        if (payload.media && Array.isArray(payload.media) && payload.media.length > 0) {
            // Upload new files to Cloudinary
            for (const file of payload.media) {
                console.log('Uploading file:', file.originalname);
                // const result = await uploadFilePathToCloudinary(file.path);
                const result = yield googleCloud.uploadFile(file.path, file.originalname);
                const newMediaItem = {
                    url: result.secure_url,
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype
                };
                finalMediaArray.push(newMediaItem);
                // If thumbnail needs updating and this is an image, use the first uploaded image as new thumbnail
                if (thumbnailUpdateNeeded && !newThumbnailData && ((_e = file.mimetype) === null || _e === void 0 ? void 0 : _e.startsWith('image/'))) {
                    newThumbnailData = {
                        url: result.secure_url,
                        name: file.originalname,
                        size: file.size,
                        type: file.mimetype
                    };
                    console.log('New thumbnail data set:', newThumbnailData);
                }
            }
        }
        else {
            console.log('No new files to upload');
        }
        payload.body.media = finalMediaArray;
        // Update thumbnail if needed and we have new thumbnail data
        if (thumbnailUpdateNeeded && newThumbnailData) {
            payload.body.thumbnail = [newThumbnailData];
            console.log('Thumbnail updated to new image');
        }
        else if (thumbnailUpdateNeeded && !newThumbnailData) {
            // If thumbnail image was removed but no new image uploaded,
            // use the first remaining image as thumbnail (if any)
            const firstRemainingImage = finalMediaArray.find((media) => { var _a; return (_a = media.type) === null || _a === void 0 ? void 0 : _a.startsWith('image/'); });
            if (firstRemainingImage) {
                payload.body.thumbnail = [{
                        url: firstRemainingImage.url,
                        name: firstRemainingImage.name,
                        size: firstRemainingImage.size,
                        type: firstRemainingImage.type
                    }];
                console.log('Thumbnail updated to first remaining image');
            }
            else {
                // No images left, clear thumbnail
                payload.body.thumbnail = [];
                console.log('No images left, thumbnail cleared');
            }
        }
    }
    // Prepare update data
    const updateData = {};
    Object.keys(payload.body).forEach(key => {
        if (payload.body[key] !== undefined && key !== 'prev_files') {
            updateData[key] = payload.body[key];
        }
    });
    if (Object.keys(updateData).length === 0) {
        return existingCollection;
    }
    // Perform the update
    const updated = yield collection_model_1.default.findOneAndUpdate({ _id: payload.collectionId }, { $set: updateData }, { new: true, runValidators: true });
    if (!updated) {
        throw new App_1.CustomError({
            message: "Failed to update collection",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
    return updated;
});
exports.updateCollectionService = updateCollectionService;

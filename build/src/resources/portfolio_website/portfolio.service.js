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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customDomainService = exports.createCustomDomainService = exports.deleteCollectionFilesService = exports.editPortfolioCollectionService = exports.updatePortfolioService = exports.deletePortfolioCollectionService = exports.userPortfolioService = exports.createPortfolioService = exports.getPortfolioService = exports.createCollectionService = void 0;
const cloudinary_1 = require("../../utils/cloudinary");
const promises_1 = __importDefault(require("node:fs/promises"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const portfolio_model_1 = __importDefault(require("./portfolio.model"));
const portfolio_model_2 = __importDefault(require("./portfolio.model"));
const collection_model_1 = __importDefault(require("./collection.model"));
const mongoose_1 = require("mongoose");
const google_cloud_1 = __importDefault(require("../../utils/google_cloud"));
const custom_domain_model_1 = require("./custom-domain.model");
const subscription_model_1 = __importDefault(require("../subscription/subscription.model"));
// export const createPortfolioService = async (payload: PortfolioInterface)=>{
//     const accessKey = `${payload.country?.toLowerCase().replace(/\s+/g, '-')}-${payload.state?.toLowerCase().replace(/\s+/g, '-')}-${payload.businessName}`;
//     const portfolioExist = await PortfolioModel.findOne({
//         accessToken: accessKey,
//     }).lean().exec()
//     if(portfolioExist){
//         throw new CustomError({
//             message: "Portfolio exist already",
//             code: StatusCodes.BAD_REQUEST
//         })
//     }
//     const uploadFiles = async (files: Express.Multer.File[]) => {
//         if (!files || files.length === 0) return [];
//
//         const uploadPromises = files.map(async (file) => {
//             try {
//                 const originalUpload = await uploadFilePathToCloudinary(file.path, "Portfolio");
//
//                 await fs.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
//
//                 return {
//                     url: originalUpload?.secure_url,
//                     name: file.originalname,
//                     size: file.size,
//                     type: file.mimetype,
//                 };
//             } catch (error) {
//                 // Attempt to delete local file even on upload failure
//                 await fs.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
//                 throw new CustomError({
//                     message: `File upload failed: ${file.originalname}`,
//                     code: StatusCodes.INTERNAL_SERVER_ERROR,
//                 });
//             }
//         });
//
//         return Promise.all(uploadPromises);
//     };
//
//     // Parallel uploads for bio images and banner
//     const [bioImages, bannerUpload] = await Promise.all([
//         uploadFiles(payload.bioImages || []),
//         payload.banner
//             ? uploadFilePathToCloudinary(payload.banner.path, "Portfolio")
//             : Promise.resolve(null)
//     ]);
//     if (payload.collections && payload.collections.length > 0) {
//         // Process each collection
//         for (let i = 0; i < payload.collections.length; i++) {
//             const collection = payload.collections[i];
//             // Array to store Cloudinary file info
//             const processedFiles = [];
//
//             // Upload each file to Cloudinary
//             if (collection.files && collection.files.length > 0) {
//                 for (const file of collection.files) {
//                     try {
//                         // Upload to Cloudinary
//                         const uploadResult = await uploadFilePathToCloudinary(file.path);
//
//                         // Create file object with Cloudinary info
//                         const fileObject = {
//                             url: uploadResult?.secure_url,
//                             name: file.originalname,
//                             size: file.size,
//                             type: file.mimetype
//                         };
//
//                         processedFiles.push(fileObject);
//
//                     } catch (error) {
//                         console.error(`Error uploading file ${file.originalname}:`, error);
//                     }
//                 }
//             }
//
//             // Update the collection with processed files
//             payload.collections[i].files = processedFiles;
//
//             // If thumbnail is undefined, use the first image as thumbnail
//             if (!payload.collections[i].thumbnail && processedFiles.length > 0) {
//                 payload.collections[i].thumbnail = processedFiles[0].url;
//             }
//         }
//     }
//     const newPayload = {
//         ...payload,
//         accessToken: accessKey,
//         username: payload.domainName?.toLowerCase(),
//         banner:{
//             url: bannerUpload?.secure_url,
//             name: payload.banner.originalname,
//             size: payload.banner.size,
//             type: payload.banner.mimetype,
//         },
//         bioImages: bioImages,
//     }
//     const response = await PortfolioModel.create(newPayload)
//     return response
// }
const createCollectionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const thumbnailFile = payload.files;
    if (!thumbnailFile || thumbnailFile.length === 0) {
        throw new App_1.CustomError({
            message: 'No valid thumbnail file provided',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const collectExist = yield collection_model_1.default.findOne({
        name: payload.name,
    });
    if (collectExist) {
        throw new App_1.CustomError({
            message: 'Folder with same name exist already',
            code: http_status_codes_1.StatusCodes.CONFLICT
        });
    }
    // validate access token
    const isValid = yield portfolio_model_1.default.findOne({
        accessToken: payload.accessKey,
    });
    if (!isValid) {
        throw new App_1.CustomError({
            message: 'Invalid acess key',
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED
        });
    }
    const newFiles = [];
    for (const file of thumbnailFile) {
        try {
            // Upload original file first
            const originalUpload = yield (0, cloudinary_1.uploadFilePathToCloudinary)(file.path, "Portfolio_thumbnails");
            newFiles.push({
                url: originalUpload.secure_url,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
            });
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
    const newPayload = Object.assign(Object.assign({}, payload), { thumbnail: newFiles[0], files: newFiles });
    const response = yield collection_model_1.default.create(newPayload);
    return response;
});
exports.createCollectionService = createCollectionService;
const getPortfolioService = (access_key) => __awaiter(void 0, void 0, void 0, function* () {
    if (!access_key) {
        throw new App_1.CustomError({
            message: 'No access key provided',
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED
        });
    }
    const response = yield portfolio_model_1.default.findOne({
        accessToken: access_key,
    }).populate('collections').lean().exec();
    return response;
});
exports.getPortfolioService = getPortfolioService;
const createPortfolioService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const accessKey = `${(_a = payload.country) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/\s+/g, '-')}-${(_b = payload.state) === null || _b === void 0 ? void 0 : _b.toLowerCase().replace(/\s+/g, '-')}-${(_c = payload.businessName) === null || _c === void 0 ? void 0 : _c.toLowerCase().replace(/\s+/g, '-')}`;
    // Check if portfolio already exists
    const portfolioExist = yield portfolio_model_1.default.findOne({
        accessToken: accessKey,
    }).lean().exec();
    if (portfolioExist) {
        throw new App_1.CustomError({
            message: "Portfolio already exists",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const googleCloud = new google_cloud_1.default();
    // Reusable function to upload files
    const uploadFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
        if (!files || files.length === 0)
            return [];
        const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const originalUpload = yield googleCloud.uploadFile(file.path, file.originalname);
                // const originalUpload = await uploadFilePathToCloudinary(file.path, "Portfolio");
                // Delete local file after upload
                yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
                return {
                    url: originalUpload === null || originalUpload === void 0 ? void 0 : originalUpload.secure_url,
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                };
            }
            catch (error) {
                // Attempt to delete local file even on upload failure
                yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
                throw new App_1.CustomError({
                    message: `File upload failed: ${file.originalname}`,
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                });
            }
        }));
        return Promise.all(uploadPromises);
    });
    // Parallel uploads for bio images and banner
    const [bioImages, bannerUpload] = yield Promise.all([
        uploadFiles(payload.bioImages || []),
        payload.banner
            ? googleCloud.uploadFile(payload.banner.path, payload.banner.originalname)
            : Promise.resolve(null)
    ]);
    // Process collections
    const processedCollections = yield Promise.all((payload.collections || []).map((collection) => __awaiter(void 0, void 0, void 0, function* () {
        // Use the uploadFiles function for consistency
        const processedFiles = yield uploadFiles(collection.files || []);
        // Set thumbnail if not defined
        let thumbnail = collection.thumbnail;
        if (!thumbnail && processedFiles.length > 0) {
            thumbnail = processedFiles[0].url;
        }
        return {
            name: collection.name,
            thumbnail,
            files: processedFiles
        };
    })));
    // Create new portfolio with processed data
    const newPayload = Object.assign(Object.assign({}, payload), { accessToken: accessKey, username: (_d = payload.domainName) === null || _d === void 0 ? void 0 : _d.toLowerCase(), banner: payload.banner ? {
            url: bannerUpload === null || bannerUpload === void 0 ? void 0 : bannerUpload.secure_url,
            name: payload.banner.originalname,
            size: payload.banner.size,
            type: payload.banner.mimetype,
        } : null, bioImages, collections: processedCollections });
    const response = yield portfolio_model_1.default.create(newPayload);
    return response;
});
exports.createPortfolioService = createPortfolioService;
const userPortfolioService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield portfolio_model_1.default.findOne({
        userId: userId,
    }).lean().exec();
    return response;
});
exports.userPortfolioService = userPortfolioService;
// export const updatePortfolioService = async (
//     payload: Partial<PortfolioInterface>,
//     portfolioId: string,
// ) => {
//     try {
//         // Find the portfolio first
//         const portfolio = await PortfolioModel.findById(portfolioId);
//         if (!portfolio) {
//             throw new CustomError({
//                 message: 'Portfolio not found',
//                 code: StatusCodes.NOT_FOUND
//             });
//         }
//
//         // Check for duplicate collection names before processing
//         if (payload.collections && Array.isArray(payload.collections)) {
//             // Get the current portfolio to check existing collection names
//             const currentPortfolio = await PortfolioModel.findById(portfolioId);
//             const existingCollectionNames = currentPortfolio?.collections?.map((c: any) => c.name) || [];
//
//             // Track duplicates
//             const duplicateCollections: string[] = [];
//
//             // Check each new collection
//             for (const collection of payload.collections) {
//                 if (collection && collection.name) {
//                     const isDuplicate = existingCollectionNames.includes(collection.name);
//
//                     if (isDuplicate) {
//                         duplicateCollections.push(collection.name);
//                     }
//                 }
//             }
//             if (duplicateCollections.length > 0) {
//                 console.log(`Duplicate collection names found: ${duplicateCollections.join(', ')}`);
//                 throw new CustomError({
//                     message: `Collection names already exist: ${duplicateCollections.join(', ')}`,
//                     code: StatusCodes.BAD_REQUEST
//                 });
//             }
//         }
//
//         // Process banner image
//         if (payload.banner) {
//             // For banner, if prev_bannerId is provided, we update that specific banner
//             const bannerId = payload.prev_bannerId ? new Types.ObjectId(payload.prev_bannerId) : new Types.ObjectId();
//             const bannerUrl = await uploadFilePathToCloudinary(payload.banner.path);
//
//             if (payload.prev_bannerId) {
//                 // Update existing banner
//                 await PortfolioModel.updateOne(
//                     {
//                         _id: portfolioId,
//                         "banner._id": bannerId
//                     },
//                     {
//                         $set: { "banner": {
//                                 url: bannerUrl.secure_url,
//                                 originalUrl: bannerUrl.secure_url,
//                                 name: payload.banner.originalname,
//                                 size: payload.banner.size,
//                                 type: payload.banner.mimetype,
//                                 _id: bannerId
//                             }}
//                     }
//                 );
//             } else {
//                 // Add new banner
//                 payload.banner = {
//                     url: bannerUrl.secure_url,
//                     originalUrl: bannerUrl.secure_url,
//                     name: payload.banner.originalname,
//                     size: payload.banner.size,
//                     type: payload.banner.mimetype,
//                     _id: bannerId
//                 };
//             }
//         }
//
//         if (payload.prev_bioImage && payload.prev_bioImage.length > 2) {
//             return;
//         }
//
//         // Handle bioImages with tracking previous files
//         if (payload.bioImages && payload.bioImages.length > 0) {
//             const prevBioImageIds = payload.prev_bioImage ? payload.prev_bioImage.map(id => new Types.ObjectId(id)) : [];
//             const updatedBioImages: any = [];
//             const newBioImages: any = [];
//
//             // Process all bioImages
//             const bioImagesPromises = payload.bioImages.map(async (image, index) => {
//                 const imageUrl = await uploadFilePathToCloudinary(image.path);
//
//                 // Check if this image is meant to update an existing image
//                 const matchingPrevId = index < prevBioImageIds.length ? prevBioImageIds[index] : null;
//
//                 // Create image object
//                 const imageObj = {
//                     url: imageUrl.secure_url,
//                     originalUrl: imageUrl.secure_url,
//                     name: image.originalname,
//                     size: image.size,
//                     type: image.mimetype,
//                     _id: matchingPrevId || new Types.ObjectId()
//                 };
//
//                 // If we have a matching previous ID, mark for update, otherwise for addition
//                 if (matchingPrevId) {
//                     updatedBioImages.push(imageObj);
//                 } else {
//                     newBioImages.push(imageObj);
//                 }
//
//                 return imageObj;
//             });
//
//             await Promise.all(bioImagesPromises);
//
//             // Update existing bioImages
//             const bioImageUpdateOperations = updatedBioImages.map((newImage: any) => {
//                 return PortfolioModel.updateOne(
//                     {
//                         _id: portfolioId,
//                         "bioImages._id": newImage._id
//                     },
//                     {
//                         $set: { "bioImages.$": newImage }
//                     }
//                 );
//             });
//             await Promise.all(bioImageUpdateOperations);
//
//             // Add new bioImages if any
//             if (Array.isArray(newBioImages) && newBioImages.length > 0) {
//                 await PortfolioModel.updateOne(
//                     { _id: portfolioId },
//                     { $push: { bioImages: { $each: newBioImages } } }
//                 );
//             }
//
//             // Remove these fields from payload as we've handled them separately
//             delete payload.bioImages;
//             delete payload.prev_bioImage;
//         }
//
//         // Handle collections
//         if (payload.collections && Array.isArray(payload.collections) && payload.collections.length > 0) {
//             // Get current portfolio data to preserve existing collections
//             const currentPortfolio = await PortfolioModel.findById(portfolioId);
//             let existingCollections = currentPortfolio?.collections || [];
//
//             // Filter out any invalid collections
//             const validCollections = payload.collections.filter(
//                 (collection: any) => collection && typeof collection === 'object'
//             );
//
//             // Process new collections from payload
//             const processedCollections = await Promise.all(
//                 validCollections.map(async (newCollection: any, idx) => {
//                     // Ensure the collection has a name
//                     if (!newCollection || !newCollection.name) {
//                         console.warn('Collection missing name property:', newCollection);
//                         // Provide a default name to prevent errors
//                         newCollection = newCollection || {};
//                         newCollection.name = `Collection ${idx + 1}`;
//                     }
//
//                     // Process files for this collection
//                     if (newCollection.files && Array.isArray(newCollection.files) && newCollection.files.length > 0) {
//                         const prevFileIds = newCollection.prev_files && Array.isArray(newCollection.prev_files) ?
//                             newCollection.prev_files.map((id: any) => new Types.ObjectId(id)) : [];
//
//                         const processedFiles = [];
//
//                         // Process each file
//                         for (let i = 0; i < newCollection.files.length; i++) {
//                             const file = newCollection.files[i];
//                             if (!file || !file.path) {
//                                 console.warn('Invalid file object:', file);
//                                 continue;
//                             }
//
//                             try {
//                                 const fileUrl = await uploadFilePathToCloudinary(file.path);
//                                 const matchingPrevId = i < prevFileIds.length ? prevFileIds[i] : null;
//
//                                 processedFiles.push({
//                                     url: fileUrl.secure_url,
//                                     originalUrl: fileUrl.secure_url,
//                                     name: file.originalname || 'unnamed file',
//                                     size: file.size || 0,
//                                     type: file.mimetype || 'application/octet-stream',
//                                     _id: matchingPrevId || new Types.ObjectId()
//                                 });
//                             } catch (fileError) {
//                                 console.error('Error processing file:', fileError);
//                                 // Continue with other files
//                             }
//                         }
//
//                         // Create processed collection object
//                         const { prev_files, ...collectionWithoutPrevFiles } = newCollection;
//                         return {
//                             ...collectionWithoutPrevFiles,
//                             files: processedFiles
//                         };
//                     }
//
//                     // If no files, return collection as is, minus prev_files
//                     const { prev_files, ...collectionWithoutPrevFiles } = newCollection;
//                     return {
//                         ...collectionWithoutPrevFiles,
//                         files: [] // Ensure files is always an array
//                     };
//                 })
//             );
//
//             // Ensure existingCollections is an array and has properly structured objects
//             if (!Array.isArray(existingCollections)) {
//                 existingCollections = [];
//             }
//
//             // Find matching collections by name or append new ones
//             const finalCollections = [...existingCollections];
//
//             processedCollections.forEach(newColl => {
//                 if (!newColl || !newColl.name) {
//                     console.warn('Processed collection missing name property:', newColl);
//                     return; // Skip this collection to avoid errors
//                 }
//
//                 // Try to find an existing collection with the same name
//                 const existingIndex = finalCollections.findIndex(
//                     (ec: any) => ec && ec.name === newColl.name
//                 );
//
//                 if (existingIndex >= 0) {
//                     // If collection exists, merge the files
//                     const existingFiles = Array.isArray(finalCollections[existingIndex].files)
//                         ? finalCollections[existingIndex].files
//                         : [];
//
//                     // Ensure newColl.files is an array
//                     const newFiles = Array.isArray(newColl.files) ? newColl.files : [];
//
//                     // If we have prev_files IDs, we need to remove those files as they're being replaced
//                     const filesToKeep = existingFiles.filter((file: any) => {
//                         if (!file || !file._id) return true; // Keep files without IDs
//                         // Check if file ID is in prev_files list
//                         return !(newColl.prev_files && Array.isArray(newColl.prev_files) && newColl.prev_files.some(
//                             (prevId: any) => prevId && file._id && prevId.toString() === file._id.toString()
//                         ));
//                     });
//
//                     // Combine with new files
//                     finalCollections[existingIndex] = {
//                         ...finalCollections[existingIndex],
//                         ...newColl,
//                         files: [
//                             ...filesToKeep,
//                             ...newFiles
//                         ]
//                     };
//                 } else {
//                     // If it's a new collection, add it
//                     finalCollections.push(newColl);
//                 }
//             });
//
//             // Update the collections array directly
//             await PortfolioModel.findByIdAndUpdate(
//                 portfolioId,
//                 { $set: { collections: finalCollections } }
//             );
//
//             // Remove collections from the payload since we handled them separately
//             delete payload.collections;
//         }
//
//         // Remove fields we've handled separately from payload
//         delete payload.prev_bannerId;
//         delete payload.prev_file;
//
//         // Update portfolio with remaining fields
//         if (Object.keys(payload).length > 0) {
//             await PortfolioModel.findByIdAndUpdate(
//                 portfolioId,
//                 { $set: payload },
//                 { new: true }
//             );
//         }
//
//         // Return the updated document
//         return await PortfolioModel.findById(portfolioId);
//     } catch (error: any) {
//         console.error('Error updating portfolio:', error);
//         throw new CustomError({
//             message: error.message || 'Error updating portfolio',
//             code: StatusCodes.INTERNAL_SERVER_ERROR
//         });
//     }
// };
// export const updatePortfolioService = async (
//     payload: Partial<PortfolioInterface>,
//     portfolioId: string,
// ) => {
//     try {
//         // Find the portfolio first
//         const portfolio = await PortfolioModel.findById(portfolioId);
//         if (!portfolio) {
//             throw new CustomError({
//                 message: 'Portfolio not found',
//                 code: StatusCodes.NOT_FOUND
//             });
//         }
//
//         // Process banner image
//         if (payload.banner) {
//             // For banner, if prev_bannerId is provided, we update that specific banner
//             const bannerId = payload.prev_bannerId ? new Types.ObjectId(payload.prev_bannerId) : new Types.ObjectId();
//             const bannerUrl = await uploadFilePathToCloudinary(payload.banner.path);
//
//             if (payload.prev_bannerId) {
//                 // Update existing banner
//                 await PortfolioModel.updateOne(
//                     {
//                         _id: portfolioId,
//                         "banner._id": bannerId
//                     },
//                     {
//                         $set: { "banner": {
//                                 url: bannerUrl.secure_url,
//                                 originalUrl: bannerUrl.secure_url,
//                                 name: payload.banner.originalname,
//                                 size: payload.banner.size,
//                                 type: payload.banner.mimetype,
//                                 _id: bannerId
//                             }}
//                     }
//                 );
//             } else {
//                 // Add new banner
//                 payload.banner = {
//                     url: bannerUrl.secure_url,
//                     originalUrl: bannerUrl.secure_url,
//                     name: payload.banner.originalname,
//                     size: payload.banner.size,
//                     type: payload.banner.mimetype,
//                     _id: bannerId
//                 };
//             }
//         }
//
//         if (payload.prev_bioImage && payload.prev_bioImage.length > 2) {
//             return;
//         }
//
//         // Handle bioImages with tracking previous files
//         if (payload.bioImages && payload.bioImages.length > 0) {
//             const prevBioImageIds = payload.prev_bioImage ? payload.prev_bioImage.map(id => new Types.ObjectId(id)) : [];
//             const updatedBioImages: any = [];
//             const newBioImages: any = [];
//
//             // Process all bioImages
//             const bioImagesPromises = payload.bioImages.map(async (image, index) => {
//                 const imageUrl = await uploadFilePathToCloudinary(image.path);
//
//                 // Check if this image is meant to update an existing image
//                 const matchingPrevId = index < prevBioImageIds.length ? prevBioImageIds[index] : null;
//
//                 // Create image object
//                 const imageObj = {
//                     url: imageUrl.secure_url,
//                     originalUrl: imageUrl.secure_url,
//                     name: image.originalname,
//                     size: image.size,
//                     type: image.mimetype,
//                     _id: matchingPrevId || new Types.ObjectId()
//                 };
//
//                 // If we have a matching previous ID, mark for update, otherwise for addition
//                 if (matchingPrevId) {
//                     updatedBioImages.push(imageObj);
//                 } else {
//                     newBioImages.push(imageObj);
//                 }
//
//                 return imageObj;
//             });
//
//             await Promise.all(bioImagesPromises);
//
//             // Update existing bioImages
//             const bioImageUpdateOperations = updatedBioImages.map((newImage: any) => {
//                 return PortfolioModel.updateOne(
//                     {
//                         _id: portfolioId,
//                         "bioImages._id": newImage._id
//                     },
//                     {
//                         $set: { "bioImages.$": newImage }
//                     }
//                 );
//             });
//             await Promise.all(bioImageUpdateOperations);
//
//             // Add new bioImages if any
//             if (Array.isArray(newBioImages) && newBioImages.length > 0) {
//                 await PortfolioModel.updateOne(
//                     { _id: portfolioId },
//                     { $push: { bioImages: { $each: newBioImages } } }
//                 );
//             }
//
//             // Remove these fields from payload as we've handled them separately
//             delete payload.bioImages;
//             delete payload.prev_bioImage;
//         }
//
//         // Handle collections
//         if (payload.collections && Array.isArray(payload.collections) && payload.collections.length > 0) {
//             // Get current portfolio data to preserve existing collections
//             const currentPortfolio = await PortfolioModel.findById(portfolioId);
//             let existingCollections = currentPortfolio?.collections || [];
//
//             // Filter out any invalid collections
//             const validCollections = payload.collections.filter(
//                 (collection: any) => collection && typeof collection === 'object'
//             );
//
//             // Check for duplicate collection names (excluding the collection being updated)
//             const duplicateCollections: string[] = [];
//
//             for (const collection of validCollections as any) {
//                 if (collection && collection.name) {
//                     // Find if this name exists in other collections (not the one being updated)
//                     const nameExists = existingCollections.some((existingCol: any) =>
//                         existingCol &&
//                         existingCol.name === collection.name &&
//                         existingCol._id?.toString() !== collection.collectionId?.toString()
//                     );
//
//                     if (nameExists) {
//                         duplicateCollections.push(collection.name);
//                     }
//                 }
//             }
//
//             if (duplicateCollections.length > 0) {
//                 console.log(`Duplicate collection names found: ${duplicateCollections.join(', ')}`);
//                 throw new CustomError({
//                     message: `Collection names already exist: ${duplicateCollections.join(', ')}`,
//                     code: StatusCodes.BAD_REQUEST
//                 });
//             }
//
//             // Process new collections from payload
//             const processedCollections = await Promise.all(
//                 validCollections.map(async (newCollection: any, idx) => {
//                     // Ensure the collection has a name
//                     if (!newCollection || !newCollection.name) {
//                         console.warn('Collection missing name property:', newCollection);
//                         // Provide a default name to prevent errors
//                         newCollection = newCollection || {};
//                         newCollection.name = `Collection ${idx + 1}`;
//                     }
//
//                     // Process files for this collection
//                     if (newCollection.files && Array.isArray(newCollection.files) && newCollection.files.length > 0) {
//                         const prevFileIds = newCollection.prev_files && Array.isArray(newCollection.prev_files) ?
//                             newCollection.prev_files.map((id: any) => new Types.ObjectId(id)) : [];
//
//                         const processedFiles = [];
//
//                         // Process each file
//                         for (let i = 0; i < newCollection.files.length; i++) {
//                             const file = newCollection.files[i];
//                             if (!file || !file.path) {
//                                 console.warn('Invalid file object:', file);
//                                 continue;
//                             }
//
//                             try {
//                                 const fileUrl = await uploadFilePathToCloudinary(file.path);
//                                 const matchingPrevId = i < prevFileIds.length ? prevFileIds[i] : null;
//
//                                 processedFiles.push({
//                                     url: fileUrl.secure_url,
//                                     originalUrl: fileUrl.secure_url,
//                                     name: file.originalname || 'unnamed file',
//                                     size: file.size || 0,
//                                     type: file.mimetype || 'application/octet-stream',
//                                     _id: matchingPrevId || new Types.ObjectId()
//                                 });
//                             } catch (fileError) {
//                                 console.error('Error processing file:', fileError);
//                                 // Continue with other files
//                             }
//                         }
//
//                         // Create processed collection object
//                         const { prev_files, ...collectionWithoutPrevFiles } = newCollection;
//                         return {
//                             ...collectionWithoutPrevFiles,
//                             files: processedFiles
//                         };
//                     }
//
//                     // If no files, return collection as is, minus prev_files
//                     const { prev_files, ...collectionWithoutPrevFiles } = newCollection;
//                     return {
//                         ...collectionWithoutPrevFiles,
//                         files: [] // Ensure files is always an array
//                     };
//                 })
//             );
//
//             // Ensure existingCollections is an array and has properly structured objects
//             if (!Array.isArray(existingCollections)) {
//                 existingCollections = [];
//             }
//
//             // Process collections: Update existing ones or add new ones
//             const finalCollections = [...existingCollections];
//
//             processedCollections.forEach(newColl => {
//                 if (!newColl || !newColl.name) {
//                     console.warn('Processed collection missing name property:', newColl);
//                     return; // Skip this collection to avoid errors
//                 }
//
//                 // First, try to find existing collection by collectionId if provided
//                 let existingIndex = -1;
//                 if (newColl.collectionId) {
//                     existingIndex = finalCollections.findIndex(
//                         (ec: any) => ec && ec._id && ec._id.toString() === newColl.collectionId.toString()
//                     );
//                 }
//
//                 if (existingIndex >= 0) {
//                     // Update existing collection by ID
//                     const existingCollection = finalCollections[existingIndex];
//                     const existingFiles = Array.isArray(existingCollection.files) ? existingCollection.files : [];
//
//                     // Ensure newColl.files is an array
//                     const newFiles = Array.isArray(newColl.files) ? newColl.files : [];
//
//                     // If we have prev_files IDs, we need to handle file replacement/updates
//                     let finalFiles = [];
//
//                     if (newFiles.length > 0) {
//                         // If we have prev_files, filter out files being replaced
//                         if (newColl.prev_files && Array.isArray(newColl.prev_files) && newColl.prev_files.length > 0) {
//                             const filesToKeep = existingFiles.filter((file: any) => {
//                                 if (!file || !file._id) return true; // Keep files without IDs
//                                 // Check if file ID is in prev_files list (being replaced)
//                                 return !newColl.prev_files.some(
//                                     (prevId: any) => prevId && file._id && prevId.toString() === file._id.toString()
//                                 );
//                             });
//
//                             // Combine kept existing files with new files
//                             finalFiles = [...filesToKeep, ...newFiles];
//                         } else {
//                             // No prev_files specified, just add new files to existing ones
//                             finalFiles = [...existingFiles, ...newFiles];
//                         }
//                     } else {
//                         // No new files, keep existing files
//                         finalFiles = existingFiles;
//                     }
//
//                     // Update the existing collection
//                     finalCollections[existingIndex] = {
//                         ...existingCollection,
//                         ...newColl,
//                         _id: existingCollection._id, // Keep the original _id
//                         files: finalFiles
//                     };
//                 } else {
//                     // It's a new collection, add it with a new ObjectId
//                     const { collectionId, ...collectionData } = newColl;
//                     finalCollections.push({
//                         ...collectionData,
//                         _id: new Types.ObjectId(), // Generate new ID for new collection
//                         files: Array.isArray(newColl.files) ? newColl.files : []
//                     });
//                 }
//             });
//
//             // Update the collections array directly
//             await PortfolioModel.findByIdAndUpdate(
//                 portfolioId,
//                 { $set: { collections: finalCollections } }
//             );
//
//             // Remove collections from the payload since we handled them separately
//             delete payload.collections;
//         }
//
//         // Remove fields we've handled separately from payload
//         delete payload.prev_bannerId;
//         delete payload.prev_file;
//
//         // Update portfolio with remaining fields
//         if (Object.keys(payload).length > 0) {
//             await PortfolioModel.findByIdAndUpdate(
//                 portfolioId,
//                 { $set: payload },
//                 { new: true }
//             );
//         }
//
//         // Return the updated document
//         return await PortfolioModel.findById(portfolioId);
//     } catch (error: any) {
//         console.error('Error updating portfolio:', error);
//         throw new CustomError({
//             message: error.message || 'Error updating portfolio',
//             code: StatusCodes.INTERNAL_SERVER_ERROR
//         });
//     }
// };
const deletePortfolioCollectionService = (collectionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const portfolioDetails = yield portfolio_model_2.default
            .findOne({ userId: userId })
            .lean()
            .exec();
        if (!portfolioDetails) {
            throw new App_1.CustomError({
                message: "Account not found",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const collection = yield portfolio_model_2.default.updateOne({ userId: userId }, {
            $pull: {
                collections: { _id: new mongoose_1.Types.ObjectId(collectionId) },
            },
        }).exec();
        return collection;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Error deleting collection",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.deletePortfolioCollectionService = deletePortfolioCollectionService;
const updatePortfolioService = (payload, portfolioId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the portfolio first
        const portfolio = yield portfolio_model_1.default.findById(portfolioId);
        if (!portfolio) {
            throw new App_1.CustomError({
                message: 'Portfolio not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const googleCloud = new google_cloud_1.default();
        // Process banner image
        if (payload.banner) {
            // For banner, if prev_bannerId is provided, we update that specific banner
            const bannerId = payload.prev_bannerId ? new mongoose_1.Types.ObjectId(payload.prev_bannerId) : new mongoose_1.Types.ObjectId();
            const bannerUrl = yield googleCloud.uploadFile(payload.banner.path, payload.banner.originalname);
            // const uploadResult = await googleCloud.uploadFile(file.path, file.originalname);
            if (payload.prev_bannerId) {
                // Update existing banner
                yield portfolio_model_1.default.updateOne({
                    _id: portfolioId,
                    "banner._id": bannerId
                }, {
                    $set: { "banner": {
                            url: bannerUrl.secure_url,
                            originalUrl: bannerUrl.secure_url,
                            name: payload.banner.originalname,
                            size: payload.banner.size,
                            type: payload.banner.mimetype,
                            _id: bannerId
                        } }
                });
            }
            else {
                // Add new banner
                payload.banner = {
                    url: bannerUrl.secure_url,
                    originalUrl: bannerUrl.secure_url,
                    name: payload.banner.originalname,
                    size: payload.banner.size,
                    type: payload.banner.mimetype,
                    _id: bannerId
                };
            }
        }
        if (payload.prev_bioImage && payload.prev_bioImage.length > 2) {
            return;
        }
        // Handle bioImages with tracking previous files
        if (payload.bioImages && payload.bioImages.length > 0) {
            const prevBioImageIds = payload.prev_bioImage ? payload.prev_bioImage.map(id => new mongoose_1.Types.ObjectId(id)) : [];
            const updatedBioImages = [];
            const newBioImages = [];
            // Process all bioImages
            const bioImagesPromises = payload.bioImages.map((image, index) => __awaiter(void 0, void 0, void 0, function* () {
                // const imageUrl = await uploadFilePathToCloudinary(image.path);
                const imageUrl = yield googleCloud.uploadFile(image.path, image.originalname);
                // Check if this image is meant to update an existing image
                const matchingPrevId = index < prevBioImageIds.length ? prevBioImageIds[index] : null;
                // Create image object
                const imageObj = {
                    url: imageUrl.secure_url,
                    originalUrl: imageUrl.secure_url,
                    name: image.originalname,
                    size: image.size,
                    type: image.mimetype,
                    _id: matchingPrevId || new mongoose_1.Types.ObjectId()
                };
                // If we have a matching previous ID, mark for update, otherwise for addition
                if (matchingPrevId) {
                    updatedBioImages.push(imageObj);
                }
                else {
                    newBioImages.push(imageObj);
                }
                return imageObj;
            }));
            yield Promise.all(bioImagesPromises);
            // Update existing bioImages
            const bioImageUpdateOperations = updatedBioImages.map((newImage) => {
                return portfolio_model_1.default.updateOne({
                    _id: portfolioId,
                    "bioImages._id": newImage._id
                }, {
                    $set: { "bioImages.$": newImage }
                });
            });
            yield Promise.all(bioImageUpdateOperations);
            // Add new bioImages if any
            if (Array.isArray(newBioImages) && newBioImages.length > 0) {
                yield portfolio_model_1.default.updateOne({ _id: portfolioId }, { $push: { bioImages: { $each: newBioImages } } });
            }
            // Remove these fields from payload as we've handled them separately
            delete payload.bioImages;
            delete payload.prev_bioImage;
        }
        // Handle collections
        if (payload.collections && Array.isArray(payload.collections) && payload.collections.length > 0) {
            // Get current portfolio data to preserve existing collections
            const currentPortfolio = yield portfolio_model_1.default.findById(portfolioId);
            let existingCollections = (currentPortfolio === null || currentPortfolio === void 0 ? void 0 : currentPortfolio.collections) || [];
            // Filter out any invalid collections
            const validCollections = payload.collections.filter((collection) => collection && typeof collection === 'object');
            // Check for duplicate collection names (excluding the collection being updated)
            const duplicateCollections = [];
            for (const collection of validCollections) {
                if (collection && collection.name) {
                    // Find if this name exists in other collections (not the one being updated)
                    const nameExists = existingCollections.some((existingCol) => {
                        var _a, _b;
                        return existingCol &&
                            existingCol.name === collection.name &&
                            ((_a = existingCol._id) === null || _a === void 0 ? void 0 : _a.toString()) !== ((_b = collection.collectionId) === null || _b === void 0 ? void 0 : _b.toString());
                    });
                    if (nameExists) {
                        duplicateCollections.push(collection.name);
                    }
                }
            }
            if (duplicateCollections.length > 0) {
                console.log(`Duplicate collection names found: ${duplicateCollections.join(', ')}`);
                throw new App_1.CustomError({
                    message: `Collection names already exist: ${duplicateCollections.join(', ')}`,
                    code: http_status_codes_1.StatusCodes.BAD_REQUEST
                });
            }
            // Process new collections from payload
            const processedCollections = yield Promise.all(validCollections.map((newCollection, idx) => __awaiter(void 0, void 0, void 0, function* () {
                // Ensure the collection has a name
                if (!newCollection || !newCollection.name) {
                    console.warn('Collection missing name property:', newCollection);
                    // Provide a default name to prevent errors
                    newCollection = newCollection || {};
                    newCollection.name = `Collection ${idx + 1}`;
                }
                // Process files for this collection
                if (newCollection.files && Array.isArray(newCollection.files) && newCollection.files.length > 0) {
                    const prevFileIds = newCollection.prev_files && Array.isArray(newCollection.prev_files) ?
                        newCollection.prev_files.map((id) => new mongoose_1.Types.ObjectId(id)) : [];
                    const processedFiles = [];
                    // Process each file
                    for (let i = 0; i < newCollection.files.length; i++) {
                        const file = newCollection.files[i];
                        if (!file || !file.path) {
                            console.warn('Invalid file object:', file);
                            continue;
                        }
                        try {
                            // const fileUrl = await uploadFilePathToCloudinary(file.path);
                            const fileUrl = yield googleCloud.uploadFile(file.path, file.originalname);
                            const matchingPrevId = i < prevFileIds.length ? prevFileIds[i] : null;
                            processedFiles.push({
                                url: fileUrl.secure_url,
                                originalUrl: fileUrl.secure_url,
                                name: file.originalname || 'unnamed file',
                                size: file.size || 0,
                                type: file.mimetype || 'application/octet-stream',
                                _id: matchingPrevId || new mongoose_1.Types.ObjectId()
                            });
                        }
                        catch (fileError) {
                            console.error('Error processing file:', fileError);
                            // Continue with other files
                        }
                    }
                    // Create processed collection object
                    const { prev_files } = newCollection, collectionWithoutPrevFiles = __rest(newCollection, ["prev_files"]);
                    return Object.assign(Object.assign({}, collectionWithoutPrevFiles), { files: processedFiles });
                }
                // If no files, return collection as is, minus prev_files
                const { prev_files } = newCollection, collectionWithoutPrevFiles = __rest(newCollection, ["prev_files"]);
                return Object.assign(Object.assign({}, collectionWithoutPrevFiles), { files: [] // Ensure files is always an array
                 });
            })));
            // Ensure existingCollections is an array and has properly structured objects
            if (!Array.isArray(existingCollections)) {
                existingCollections = [];
            }
            // Process collections: Update existing ones or add new ones
            const finalCollections = [...existingCollections];
            processedCollections.forEach(newColl => {
                if (!newColl || !newColl.name) {
                    console.warn('Processed collection missing name property:', newColl);
                    return; // Skip this collection to avoid errors
                }
                // First, try to find existing collection by collectionId if provided
                let existingIndex = -1;
                if (newColl.collectionId) {
                    existingIndex = finalCollections.findIndex((ec) => ec && ec._id && ec._id.toString() === newColl.collectionId.toString());
                }
                if (existingIndex >= 0) {
                    // Update existing collection by ID
                    const existingCollection = finalCollections[existingIndex];
                    const existingFiles = Array.isArray(existingCollection.files) ? existingCollection.files : [];
                    // Ensure newColl.files is an array
                    const newFiles = Array.isArray(newColl.files) ? newColl.files : [];
                    // If we have prev_files IDs, we need to handle file replacement/updates
                    let finalFiles = [];
                    if (newFiles.length > 0) {
                        // If we have prev_files, filter out files being replaced
                        if (newColl.prev_files && Array.isArray(newColl.prev_files) && newColl.prev_files.length > 0) {
                            const filesToKeep = existingFiles.filter((file) => {
                                if (!file || !file._id)
                                    return true; // Keep files without IDs
                                // Check if file ID is in prev_files list (being replaced)
                                return !newColl.prev_files.some((prevId) => prevId && file._id && prevId.toString() === file._id.toString());
                            });
                            // Combine kept existing files with new files
                            finalFiles = [...filesToKeep, ...newFiles];
                        }
                        else {
                            // No prev_files specified, just add new files to existing ones
                            finalFiles = [...existingFiles, ...newFiles];
                        }
                    }
                    else {
                        // No new files, keep existing files
                        finalFiles = existingFiles;
                    }
                    // Update the existing collection
                    finalCollections[existingIndex] = Object.assign(Object.assign(Object.assign({}, existingCollection), newColl), { _id: existingCollection._id, files: finalFiles });
                }
                else {
                    // It's a new collection, add it with a new ObjectId
                    const { collectionId } = newColl, collectionData = __rest(newColl, ["collectionId"]);
                    finalCollections.push(Object.assign(Object.assign({}, collectionData), { _id: new mongoose_1.Types.ObjectId(), files: Array.isArray(newColl.files) ? newColl.files : [] }));
                }
            });
            // Update the collections array directly
            yield portfolio_model_1.default.findByIdAndUpdate(portfolioId, { $set: { collections: finalCollections } });
            // Remove collections from the payload since we handled them separately
            delete payload.collections;
        }
        // Remove fields we've handled separately from payload
        delete payload.prev_bannerId;
        delete payload.prev_file;
        // Update portfolio with remaining fields
        if (Object.keys(payload).length > 0) {
            yield portfolio_model_1.default.findByIdAndUpdate(portfolioId, { $set: payload }, { new: true });
        }
        // Return the updated document
        return yield portfolio_model_1.default.findById(portfolioId);
    }
    catch (error) {
        console.error('Error updating portfolio:', error);
        throw new App_1.CustomError({
            message: error.message || 'Error updating portfolio',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.updatePortfolioService = updatePortfolioService;
const editPortfolioCollectionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Validate required fields
    if (!payload.collectionId) {
        throw new App_1.CustomError({
            message: "Collection Id is missing",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    // Find the existing portfolio
    const existingPortfolio = yield portfolio_model_1.default.findById(payload.portfolioId);
    if (!existingPortfolio) {
        throw new App_1.CustomError({
            message: "Portfolio not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND
        });
    }
    // Find the specific collection within the portfolio
    const collectionIndex = (_a = existingPortfolio.collections) === null || _a === void 0 ? void 0 : _a.findIndex((collection) => { var _a; return ((_a = collection._id) === null || _a === void 0 ? void 0 : _a.toString()) === payload.collectionId; });
    if (collectionIndex === -1 || collectionIndex === undefined) {
        throw new App_1.CustomError({
            message: "Collection not found in portfolio",
            code: http_status_codes_1.StatusCodes.NOT_FOUND
        });
    }
    const targetCollection = existingPortfolio.collections[collectionIndex];
    const googleCloud = new google_cloud_1.default();
    let updatedFiles = [...(targetCollection.files || [])]; // Copy existing files
    // Handle file uploads to Google Cloud
    const uploadedFiles = [];
    if (payload.files && payload.files.length > 0) {
        for (const file of payload.files) {
            try {
                const uploadResult = yield googleCloud.uploadFile(file.path, file.originalname);
                uploadedFiles.push({
                    url: uploadResult.secure_url,
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype
                });
            }
            catch (error) {
                throw new App_1.CustomError({
                    message: `Failed to upload file: ${file.originalname}`,
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
                });
            }
        }
    }
    // Case 1: Replace specific files if prev_files is provided
    if (payload.prev_files && payload.prev_files.length > 0) {
        // Find files to replace by their IDs
        const filesToReplace = payload.prev_files;
        let replacementIndex = 0;
        // Loop through existing files and replace those with matching IDs
        updatedFiles = updatedFiles.map(file => {
            var _a;
            if (filesToReplace.includes(((_a = file._id) === null || _a === void 0 ? void 0 : _a.toString()) || '')) {
                // Replace with new uploaded file if available
                if (replacementIndex < uploadedFiles.length) {
                    const newFile = uploadedFiles[replacementIndex];
                    replacementIndex++;
                    return Object.assign(Object.assign({}, newFile), { _id: file._id // Keep the same ID for replacement
                     });
                }
            }
            return file; // Keep existing file if not being replaced
        });
        // If there are more uploaded files than files to replace, add them
        if (replacementIndex < uploadedFiles.length) {
            const remainingFiles = uploadedFiles.slice(replacementIndex);
            updatedFiles.push(...remainingFiles);
        }
    }
    // Case 2: Add new files if prev_files is empty or not provided
    else {
        // Simply add all uploaded files to existing files
        updatedFiles.push(...uploadedFiles);
    }
    // Update the collection with new files and other properties
    const updatedCollection = Object.assign(Object.assign({}, targetCollection.toObject()), { name: payload.name || targetCollection.name, thumbnail: payload.thumbnail || targetCollection.thumbnail, files: updatedFiles });
    // Update the portfolio with the modified collection
    existingPortfolio.collections[collectionIndex] = updatedCollection;
    // Save the updated portfolio
    const savedPortfolio = yield existingPortfolio.save();
    return {
        portfolio: savedPortfolio,
        updatedCollection: savedPortfolio.collections[collectionIndex],
        message: payload.prev_files && payload.prev_files.length > 0
            ? "Files replaced successfully"
            : "Files added successfully"
    };
});
exports.editPortfolioCollectionService = editPortfolioCollectionService;
const deleteCollectionFilesService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { portfolioId, collectionId, filesId } = payload;
        if (!portfolioId || !collectionId || !filesId) {
            throw new App_1.CustomError({
                message: "Portfolio ID, Collection ID, and Files ID are required",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const portfolioRecords = yield portfolio_model_1.default.findOne({
            _id: payload.portfolioId,
        }).lean().exec();
        if (!portfolioRecords) {
            throw new App_1.CustomError({
                message: "Portfolio not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const collection = portfolioRecords.collections.find((cols) => cols._id.toString() === collectionId);
        if (!collection) {
            throw new App_1.CustomError({
                message: "Collection not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const fileIdsToDelete = Array.isArray(filesId) ? filesId : [filesId];
        const existingFileIds = ((_a = collection.files) === null || _a === void 0 ? void 0 : _a.map((file) => file._id.toString())) || [];
        const validFileIds = fileIdsToDelete.filter(id => existingFileIds.includes(id));
        if (validFileIds.length === 0) {
            throw new App_1.CustomError({
                message: "No valid files found to delete",
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        const updatedPortfolio = yield portfolio_model_1.default.findOneAndUpdate({
            _id: portfolioId,
            "collections._id": collectionId
        }, {
            $pull: {
                "collections.$.files": {
                    _id: { $in: validFileIds }
                }
            },
            $set: {
                updatedAt: new Date()
            }
        }, {
            new: true,
            runValidators: true
        }).lean().exec();
        if (!updatedPortfolio) {
            throw new App_1.CustomError({
                message: "Failed to delete files from collection",
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
        const updatedCollection = (_b = updatedPortfolio.collections) === null || _b === void 0 ? void 0 : _b.find((col) => col._id.toString() === collectionId);
        return updatedCollection;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Something went wrong',
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.deleteCollectionFilesService = deleteCollectionFilesService;
const createCustomDomainService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const domainExist = yield custom_domain_model_1.CustomDomainModel.findOne({
        customDomain: payload.customDomain,
    }).lean().exec();
    if (domainExist) {
        throw new App_1.CustomError({
            message: "Domain is not available try another domain!",
            code: http_status_codes_1.StatusCodes.CONFLICT
        });
    }
    const activeSubscription = yield subscription_model_1.default.findOne({
        userId: payload.userId,
    }).populate('pricingId').lean().exec();
    if (!activeSubscription) {
        throw new App_1.CustomError({
            message: "No active subscription",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    if (((_a = activeSubscription === null || activeSubscription === void 0 ? void 0 : activeSubscription.pricingId) === null || _a === void 0 ? void 0 : _a.plan) === 'Free') {
        throw new App_1.CustomError({
            message: "Please upgrade your plan to be eligible for this feature!",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield custom_domain_model_1.CustomDomainModel.create(payload);
    return response;
});
exports.createCustomDomainService = createCustomDomainService;
const customDomainService = (customDomain) => __awaiter(void 0, void 0, void 0, function* () {
    const profileDetails = yield custom_domain_model_1.CustomDomainModel.findOne({
        customDomain: customDomain,
    }).lean().exec();
    if (!profileDetails) {
        return 'Contact Support';
    }
    const response = yield portfolio_model_1.default.findOne({
        userId: profileDetails.userId,
    }).populate('collections').lean().exec();
    return response;
});
exports.customDomainService = customDomainService;

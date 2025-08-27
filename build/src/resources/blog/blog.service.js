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
exports.scheduledPostsService = exports.deleteBlogPostService = exports.updateBlogPostService = exports.blogPostService = exports.blogPostsService = exports.createBlogDraftPostService = exports.createBlogPostService = void 0;
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const blog_model_1 = __importDefault(require("./blog.model"));
const cloudinary_1 = require("../../utils/cloudinary");
const promises_1 = __importDefault(require("node:fs/promises"));
const blog_draft_model_1 = __importDefault(require("./blog_draft.model"));
const createBlogPostService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const files = payload.thumbnail;
    if (!files || files.length === 0) {
        throw new App_1.CustomError({
            message: 'No files provided',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const blogExist = yield blog_model_1.default.findOne({
        title: payload.title,
    });
    if (blogExist) {
        throw new App_1.CustomError({
            message: 'Blog already exist',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const newFiles = [];
    for (const file of files) {
        try {
            const originalUpload = yield (0, cloudinary_1.uploadFilePathToCloudinary)(file.path, "blog");
            newFiles.push({
                url: originalUpload.secure_url,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
            });
            // Clean up temp file immediately after processing
            yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
        }
        catch (error) {
            // Clean up this file if there was an error
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
    const newPayload = Object.assign(Object.assign({}, payload), { thumbnail: newFiles });
    const response = yield blog_model_1.default.create(newPayload);
    return response;
});
exports.createBlogPostService = createBlogPostService;
const createBlogDraftPostService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const files = payload.thumbnail;
    if (!files || files.length === 0) {
        throw new App_1.CustomError({
            message: 'No files provided',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const blogExist = yield blog_draft_model_1.default.findOne({
        title: payload.title,
    });
    if (blogExist) {
        throw new App_1.CustomError({
            message: 'Blog already exist',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const newFiles = [];
    for (const file of files) {
        try {
            const originalUpload = yield (0, cloudinary_1.uploadFilePathToCloudinary)(file.path, "blog");
            newFiles.push({
                url: originalUpload.secure_url,
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
            });
            // Clean up temp file immediately after processing
            yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
        }
        catch (error) {
            // Clean up this file if there was an error
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
    const newPayload = Object.assign(Object.assign({}, payload), { description: payload.description, thumbnail: newFiles });
    const response = yield blog_draft_model_1.default.create(newPayload);
    return response;
});
exports.createBlogDraftPostService = createBlogDraftPostService;
const blogPostsService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield blog_model_1.default.find({}).populate("userId", "profile_image business_name").sort({ createdAt: -1 });
        return response;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Error fetching blogs",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.blogPostsService = blogPostsService;
const blogPostService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield blog_model_1.default.findOne({
            _id: payload.blog_id
        }).populate("userId", "profile_image business_name");
        const relatedPosts = yield blog_model_1.default.find({
            _id: { $ne: response === null || response === void 0 ? void 0 : response._id }, // Exclude current blog
            $or: [
                { category: response === null || response === void 0 ? void 0 : response.category },
                { tags: { $in: response === null || response === void 0 ? void 0 : response.tags } }
            ]
        }).limit(3);
        return {
            post: response,
            related: relatedPosts
        };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Error fetching blogs",
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.blogPostService = blogPostService;
const updateBlogPostService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const updatePayload = Object.assign({}, payload);
    delete updatePayload.blogId; // Remove ID from update payload
    const files = payload.thumbnail;
    // Only process thumbnail if files are provided
    if (files && files.length > 0) {
        const newFiles = [];
        for (const file of files) {
            try {
                const originalUpload = yield (0, cloudinary_1.uploadFilePathToCloudinary)(file.path, "blog");
                newFiles.push({
                    url: originalUpload.secure_url,
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                });
                // Clean up temp file immediately after processing
                yield promises_1.default.unlink(file.path).catch(err => console.error(`Error deleting temp file: ${err}`));
            }
            catch (error) {
                // Clean up this file if there was an error
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
        // Only update thumbnail field if we have new files
        if (newFiles.length > 0) {
            updatePayload.thumbnail = newFiles;
        }
    }
    else {
        // Important: Remove thumbnail from payload if no files were sent
        // This prevents MongoDB from setting thumbnail to null or empty array
        delete updatePayload.thumbnail;
    }
    // Update only the fields that were provided
    const response = yield blog_model_1.default.findOneAndUpdate({ _id: payload.blogId }, updatePayload, { new: true });
    return response;
});
exports.updateBlogPostService = updateBlogPostService;
const deleteBlogPostService = (blogId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("deleting blog post");
    const response = yield blog_model_1.default.findOneAndDelete({
        _id: blogId,
    });
    return response;
});
exports.deleteBlogPostService = deleteBlogPostService;
const scheduledPostsService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield blog_model_1.default.find({
            scheduled_date: { $exists: true, $ne: null },
            scheduled_time: { $exists: true, $ne: null }
        }).lean().exec();
        return data;
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Error Fetching scheduled blog posts",
            code: http_status_codes_1.StatusCodes.EXPECTATION_FAILED
        });
    }
});
exports.scheduledPostsService = scheduledPostsService;

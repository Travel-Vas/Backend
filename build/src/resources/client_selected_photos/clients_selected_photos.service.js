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
exports.client_download_notification_Service = exports.download_selected_photos_name_service = exports.get_selected_client_photos_service = exports.client_selected_photos_service = void 0;
const clients_model_1 = __importDefault(require("../clients/clients.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const client_selected_photos_model_1 = __importDefault(require("./client_selected_photos.model"));
const shoots_model_1 = require("../photoshoots/shoots.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../users/user.model"));
const shoots_interface_1 = require("../photoshoots/shoots.interface");
const file_names_models_1 = __importDefault(require("./file.names.models"));
const donwload_notification_model_1 = __importDefault(require("./donwload.notification.model"));
const edited_shoots_model_1 = __importDefault(require("../photoshoots/edited_shoots.model"));
const client_selected_photos_service = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const shootExist = yield shoots_model_1.ShootsModel.findOne({
        _id: payload.shoot_id,
    });
    if (!shootExist) {
        throw new App_1.CustomError({
            message: 'Shoot does not exist',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const selectExist = yield client_selected_photos_model_1.default.findOne({
        shoot_id: payload.shoot_id,
        access_key: payload.access_key,
        selected_photos: payload.selected_photos
    });
    if (selectExist) {
        throw new App_1.CustomError({
            message: 'Selection already exists',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (!shootExist.hashed_access_key) {
        throw new App_1.CustomError({
            message: 'Shoot does not have a hashed access key',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const validateAccessKey = yield bcryptjs_1.default.compare(payload.access_key, shootExist.hashed_access_key);
    if (!validateAccessKey) {
        throw new App_1.CustomError({
            message: 'Invalid access key',
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED
        });
    }
    if (payload.selected_photos.length === 0) {
        throw new App_1.CustomError({
            message: 'No selected photo found',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (payload.selected_photos.length > shootExist.max_pictures) {
        throw new App_1.CustomError({
            message: 'Max pictures selected pay to select more!',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (shootExist.files && Array.isArray(shootExist.files)) {
        const selectedPhotoIds = new Set(payload.selected_photos.map(photo => photo._id.toString()));
        // Update all selected photos in a single operation
        yield shoots_model_1.ShootsModel.updateOne({ _id: shootExist._id }, {
            $set: {
                "files.$[elem].selected": true,
                "shoot_status": shoots_interface_1.Shoot_Status.PICTURE_SELECTED
            }
        }, {
            arrayFilters: [{ "elem._id": { $in: Array.from(selectedPhotoIds) } }]
        });
    }
    const response = yield client_selected_photos_model_1.default.create(payload);
    if (!response) {
        throw new App_1.CustomError({
            message: 'Error uploading selected photo',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
    const userDetials = yield user_model_1.default.findOne({
        _id: shootExist.user_id,
    });
    const clientDetails = yield clients_model_1.default.findOne({
        _id: shootExist.client_id,
    });
    if (clientDetails) {
        clientDetails.selection_submitted = true;
        yield clientDetails.updateOne({ selection_submitted: true });
    }
    // Send Mail to Photographer
    const dashboard_url = "https://www.fotolocker.io/client-sign-in";
    yield new App_1.EmailService().clientSelectedPhotosMail("Client Selections Notification", userDetials === null || userDetials === void 0 ? void 0 : userDetials.email, userDetials === null || userDetials === void 0 ? void 0 : userDetials.business_name, payload.selected_photos.length, (_a = shootExist === null || shootExist === void 0 ? void 0 : shootExist.files) === null || _a === void 0 ? void 0 : _a.length, clientDetails === null || clientDetails === void 0 ? void 0 : clientDetails.name, shootExist === null || shootExist === void 0 ? void 0 : shootExist.purpose, shootExist === null || shootExist === void 0 ? void 0 : shootExist.shoot_date, shootExist === null || shootExist === void 0 ? void 0 : shootExist.max_pictures, dashboard_url);
    return response;
});
exports.client_selected_photos_service = client_selected_photos_service;
const get_selected_client_photos_service = (userId, shoot_id) => __awaiter(void 0, void 0, void 0, function* () {
    const shootDetails = yield shoots_model_1.ShootsModel.findOne({
        _id: shoot_id,
        user_id: userId
    });
    if (!shootDetails) {
        throw new App_1.CustomError({
            message: 'Invalid shoot id',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const photos = yield client_selected_photos_model_1.default.findOne({
        shoot_id: shoot_id
    });
    const client_phots = [];
    if (photos) {
        for (const photo of photos === null || photos === void 0 ? void 0 : photos.selected_photos) {
            const construct = {
                url: photo.originalUrl,
                name: photo.name,
                size: photo.size,
                type: photo.type,
                id: photo._id
            };
            client_phots.push(construct);
        }
    }
    return client_phots;
});
exports.get_selected_client_photos_service = get_selected_client_photos_service;
const download_selected_photos_name_service = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const recordExist = yield file_names_models_1.default.findOne({
        selected_files: payload.payload,
        userId: payload.userId
    });
    if (recordExist) {
        throw new App_1.CustomError({
            message: 'Record exist already',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield file_names_models_1.default.create({
        userId: payload.userId,
        selected_files: payload.payload,
    });
    return response;
});
exports.download_selected_photos_name_service = download_selected_photos_name_service;
const client_download_notification_Service = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shootDetails = yield shoots_model_1.ShootsModel.findOne({
            _id: payload.shoot_id,
        }).lean().exec();
        if (!shootDetails) {
            throw new App_1.CustomError({
                message: "Shoot not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        const editedShoots = yield edited_shoots_model_1.default.findOne({
            shoot_id: shootDetails._id,
        }).lean().exec();
        const downloaded = yield donwload_notification_model_1.default.findOne({
            shoot_id: payload.shoot_id,
            client_id: payload.client_id,
        }).lean().exec();
        if (downloaded) {
            // throw new CustomError({
            //     message: "Notification sent already",
            //     code: StatusCodes.CONTINUE
            // })
            return;
        }
        const userDetials = yield user_model_1.default.findOne({
            _id: shootDetails.user_id,
        }).lean().exec();
        const clientDetails = yield clients_model_1.default.findOne({
            _id: shootDetails.client_id,
        }).lean().exec();
        yield donwload_notification_model_1.default.create(payload);
        const dashboard_url = "https://www.fotolocker.io/client-sign-in";
        yield new App_1.EmailService().clientDownloadNotificationMail("Client Downloads Notification", userDetials === null || userDetials === void 0 ? void 0 : userDetials.email, userDetials === null || userDetials === void 0 ? void 0 : userDetials.business_name, shootDetails === null || shootDetails === void 0 ? void 0 : shootDetails.purpose, shootDetails === null || shootDetails === void 0 ? void 0 : shootDetails.purpose, clientDetails === null || clientDetails === void 0 ? void 0 : clientDetails.name, payload.download_date, 
        // editedShoots?.files.length,
        dashboard_url);
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message,
            code: error.code,
        });
    }
});
exports.client_download_notification_Service = client_download_notification_Service;

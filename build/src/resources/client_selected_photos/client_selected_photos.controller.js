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
Object.defineProperty(exports, "__esModule", { value: true });
exports.client_download_notification = exports.download_selected_photos_name = exports.get_selected_client_photos = exports.client_selected_photos = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const clients_selected_photos_service_1 = require("./clients_selected_photos.service");
const App_1 = require("../../helpers/lib/App");
const client_selected_photos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        access_key: req.body.access_key,
        shoot_id: req.body.shoot_id,
        selected_photos: req.body.selected_photos,
    };
    const response = yield (0, clients_selected_photos_service_1.client_selected_photos_service)(payload);
    res.json({
        msg: "photos selected successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.client_selected_photos = client_selected_photos;
const get_selected_client_photos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req['user']._id;
    const shoot_id = req.params.shootId;
    const response = yield (0, clients_selected_photos_service_1.get_selected_client_photos_service)(user_id, shoot_id);
    res.json({
        msg: "photos retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.get_selected_client_photos = get_selected_client_photos;
const download_selected_photos_name = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Array.isArray(req.body.payload) ? req.body.payload : req.body.payload;
    if (!payload || payload.length <= 0) {
        throw new App_1.CustomError({
            message: 'Fields is required',
            code: status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const newPayload = {
        payload: payload,
        userId: req['user']._id,
    };
    const response = yield (0, clients_selected_photos_service_1.download_selected_photos_name_service)(newPayload);
    res.json({
        msg: "data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.download_selected_photos_name = download_selected_photos_name;
const client_download_notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Payload = {
        download_count: req.body.download_count,
        download_date: new Date().toISOString(),
        shoot_id: req.body.shoot_id,
        client_id: req.body.client_id
    };
    if (!Payload.client_id) {
        throw new App_1.CustomError({
            message: 'Unauthorized, Client or Shoot Id missing',
            code: status_codes_1.StatusCodes.UNAUTHORIZED,
        });
    }
    const response = yield (0, clients_selected_photos_service_1.client_download_notification_Service)(Payload);
    res.json({
        msg: "Notification sent successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.client_download_notification = client_download_notification;

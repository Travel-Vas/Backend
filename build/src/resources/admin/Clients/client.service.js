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
exports.clientCollectionDetailsService = exports.clientCollectionService = exports.allClientsService = void 0;
const clients_model_1 = __importDefault(require("../../clients/clients.model"));
const App_1 = require("../../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const shoots_model_1 = require("../../photoshoots/shoots.model");
const client_selected_photos_model_1 = __importDefault(require("../../client_selected_photos/client_selected_photos.model"));
const allClientsService = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const clients = yield clients_model_1.default.find().sort({ created_at: -1 }).populate("user_id", "email role referralCode business_name");
    const clientsWithPhotographers = yield Promise.all(clients.map((client) => __awaiter(void 0, void 0, void 0, function* () {
        let totalSelectedPhotos = 0;
        const distinctPhotographers = yield clients_model_1.default.distinct("user_id", {
            // user_id: { $ne: null },
            user_id: client.user_id,
            email: client.email,
        });
        const shoots = yield shoots_model_1.ShootsModel.find({ client_id: client.id }, { files: 1 });
        for (const shoot of shoots) {
            const selectedPhotos = yield client_selected_photos_model_1.default.find({
                shoot_id: shoot._id,
            }, {
                selected_photos: 1
            });
            for (const selection of selectedPhotos) {
                totalSelectedPhotos += selection.selected_photos ? selection.selected_photos.length : 0;
            }
        }
        const totalFiles = shoots.reduce((total, shoot) => {
            return total + (shoot.files ? shoot.files.length : 0);
        }, 0);
        const clientObj = client.toObject();
        clientObj.photographers = distinctPhotographers.length;
        clientObj.uploads = totalFiles;
        clientObj.selectedPhotos = totalSelectedPhotos;
        return clientObj;
    })));
    return clientsWithPhotographers;
});
exports.allClientsService = allClientsService;
const clientCollectionService = (clients_id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!clients_id) {
        throw new App_1.CustomError({
            message: "No clients id",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const response = yield shoots_model_1.ShootsModel.find({
        client_id: clients_id,
    })
        .populate("user_id", "email role referralCode business_name")
        .populate("client_id");
    return response;
});
exports.clientCollectionService = clientCollectionService;
const clientCollectionDetailsService = (client_id, shoot_id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!client_id || !shoot_id) {
        throw new App_1.CustomError({
            message: "Client id or collection id is missing",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
    }
    const response = yield shoots_model_1.ShootsModel.findOne({
        client_id: client_id,
        _id: shoot_id,
    }).lean().exec();
    return response;
});
exports.clientCollectionDetailsService = clientCollectionDetailsService;

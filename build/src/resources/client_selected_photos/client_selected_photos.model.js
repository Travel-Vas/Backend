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
const constants_1 = require("../../helpers/constants");
const mongoose_1 = require("mongoose");
const shoots_model_1 = require("../photoshoots/shoots.model");
// ClientsSelectedPhotos Schema
const ClientsSelectedPhotosSchema = new mongoose_1.Schema({
    access_key: {
        type: String,
        unique: true,
    },
    shoot_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Shoot',
        unique: true
    },
    selected_photos: {
        type: [
            {
                url: { type: String, required: true },
                originalUrl: { type: String, required: true },
                name: { type: String, required: true },
                size: { type: Number, required: true },
                type: { type: String, required: true },
                _id: { type: String, required: true },
            },
        ],
        required: true, // Ensure the photos array is required
    },
}, {
    timestamps: true,
});
ClientsSelectedPhotosSchema.post('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch the associated Shoot document using the shoot_id from the current ClientsSelectedPhotos document
            const shoot = yield shoots_model_1.ShootsModel.findById(this.shoot_id);
            // If the Shoot is found, update the shoot's client_selections using $push or $addToSet
            if (shoot) {
                yield shoots_model_1.ShootsModel.updateOne({ _id: this.shoot_id }, {
                    $addToSet: {
                        client_selections: { $each: this.selected_photos }, // Use $each to add multiple items at once
                    },
                });
            }
        }
        catch (error) {
            console.error("Error updating Shoot model with selected photos:", error);
        }
    });
});
// Create and export the ClientsSelectedPhotos model
const ClientsSelectedPhotos = (0, mongoose_1.model)(constants_1.CLIENT_SELECTED_PHOTOS, ClientsSelectedPhotosSchema);
exports.default = ClientsSelectedPhotos;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const FileSchema = {
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    size: {
        type: Number,
        required: false
    },
    type: {
        type: String,
        required: false
    }
};
const editedPhotosSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    files: {
        type: [FileSchema],
        required: true
    },
    shoot_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false,
        ref: 'Shoot'
    },
    client_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    }
}, {
    timestamps: true
});
const EditedPhotos = (0, mongoose_1.model)(constants_1.EDITED_PHOTOS, editedPhotosSchema);
exports.default = EditedPhotos;

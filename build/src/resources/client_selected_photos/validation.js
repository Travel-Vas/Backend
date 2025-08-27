"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editedShootsSchema = exports.clientsSelectedPhotosSchema = void 0;
const yup_1 = require("yup");
exports.clientsSelectedPhotosSchema = (0, yup_1.object)({
    access_key: (0, yup_1.string)().required('Client ID is required'),
    shoot_id: (0, yup_1.string)().required('Shoot ID is required'),
    selected_photos: (0, yup_1.array)()
        .of((0, yup_1.object)({
        url: (0, yup_1.string)().url('Each photo must have a valid URL').required('Photo URL is required'),
        originalUrl: (0, yup_1.string)().url('Each photo must have a valid original URL').required('Original photo URL is required'),
        name: (0, yup_1.string)().required('Photo name is required'),
        size: (0, yup_1.number)().required('Photo size is required'),
        type: (0, yup_1.string)().required('Photo type is required'),
        _id: (0, yup_1.string)().required('Photo ID is required'),
    }))
        .min(1, 'At least one photo is required')
        .required('Selected photos are required'),
});
exports.editedShootsSchema = (0, yup_1.object)({
    shoot_id: (0, yup_1.string)().required('Shoot ID is required'),
    client_id: (0, yup_1.string)().required('Client ID is required'),
});

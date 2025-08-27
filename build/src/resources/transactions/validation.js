"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientExtraPhotoSchema = exports.ClientSchema = void 0;
const yup_1 = require("yup");
exports.ClientSchema = (0, yup_1.object)({
    clientId: (0, yup_1.string)().required('Client ID is required'),
    email: (0, yup_1.string)()
        .email('Must be a valid email address')
        .required('Email is required'),
    packageType: (0, yup_1.string)().required('Package type is required'),
    noOfPhotos: (0, yup_1.number)()
        .typeError('Number of photos must be a valid number')
        .positive('Number of photos must be a positive number')
        .integer('Number of photos must be an integer')
        .required('Number of photos is required'),
    reason: (0, yup_1.string)().required('Reason is required'),
});
exports.ClientExtraPhotoSchema = (0, yup_1.object)({
    clientId: (0, yup_1.string)().required('Client ID is required'),
    accessKey: (0, yup_1.string)().required('AccessKey is required'),
    email: (0, yup_1.string)()
        .email('Must be a valid email address')
        .required('Email is required'),
    packageType: (0, yup_1.string)().required('Package type is required'),
    noOfPhotos: (0, yup_1.number)()
        .typeError('Number of photos must be a valid number')
        .positive('Number of photos must be a positive number')
        .integer('Number of photos must be an integer')
        .required('Number of photos is required'),
    reason: (0, yup_1.string)().required('Reason is required'),
});

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
exports.getTripsByStatusService = exports.deleteTripService = exports.updateTripService = exports.getTripByIdService = exports.getAllTripsHistoryService = exports.getAllTripsService = exports.createTripService = void 0;
const booking_model_1 = require("./booking.model");
const cloudinary_1 = require("../../utils/cloudinary");
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const constants_1 = require("../../helpers/constants");
const createTripService = (tripData, files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let documentUrls = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const uploadResult = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'trip-documents');
                return uploadResult.secure_url;
            }));
            documentUrls = yield Promise.all(uploadPromises);
        }
        const trip = new booking_model_1.Trip(Object.assign(Object.assign({}, tripData), { documents: documentUrls }));
        return yield trip.save();
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to create trip',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.createTripService = createTripService;
const getAllTripsService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, userId) {
    try {
        const skip = (page - 1) * limit;
        const trips = yield booking_model_1.Trip.find({
            creator: constants_1.UserRole.ADMIN
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = yield booking_model_1.Trip.countDocuments();
        const pages = Math.ceil(total / limit);
        return { trips, total, pages };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch trips',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getAllTripsService = getAllTripsService;
const getAllTripsHistoryService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, userId) {
    try {
        const skip = (page - 1) * limit;
        const trips = yield booking_model_1.Trip.find({
            userId: userId,
            creator: { $in: ["", null] },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = yield booking_model_1.Trip.countDocuments();
        const pages = Math.ceil(total / limit);
        return { trips, total, pages };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch trips',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getAllTripsHistoryService = getAllTripsHistoryService;
const getTripByIdService = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trip = yield booking_model_1.Trip.findById(tripId);
        if (!trip) {
            throw new App_1.CustomError({
                message: 'Trip not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        return trip;
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch trip',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getTripByIdService = getTripByIdService;
const updateTripService = (tripId, updateData, files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trip = yield booking_model_1.Trip.findById(tripId);
        if (!trip) {
            throw new App_1.CustomError({
                message: 'Trip not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        let documentUrls = trip.documents || [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const uploadResult = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'trip-documents');
                return uploadResult.secure_url;
            }));
            const newUrls = yield Promise.all(uploadPromises);
            documentUrls = [...documentUrls, ...newUrls];
        }
        const updatedTrip = yield booking_model_1.Trip.findByIdAndUpdate(tripId, Object.assign(Object.assign({}, updateData), { documents: documentUrls }), { new: true, runValidators: true });
        return updatedTrip;
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || 'Failed to update trip',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.updateTripService = updateTripService;
const deleteTripService = (tripId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trip = yield booking_model_1.Trip.findById(tripId);
        if (!trip) {
            throw new App_1.CustomError({
                message: 'Trip not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        yield booking_model_1.Trip.findByIdAndDelete(tripId);
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        throw new App_1.CustomError({
            message: error.message || 'Failed to delete trip',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.deleteTripService = deleteTripService;
const getTripsByStatusService = (status_1, ...args_1) => __awaiter(void 0, [status_1, ...args_1], void 0, function* (status, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const trips = yield booking_model_1.Trip.find({ status })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = yield booking_model_1.Trip.countDocuments({ status });
        const pages = Math.ceil(total / limit);
        return { trips, total, pages };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch trips by status',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getTripsByStatusService = getTripsByStatusService;

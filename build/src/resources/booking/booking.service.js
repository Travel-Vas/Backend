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
exports.analyticsService = exports.getRecentBookedTripsService = exports.getTripsByStatusService = exports.deleteTripService = exports.updateTripService = exports.getTripByIdService = exports.getAllTripsHistoryService = exports.getAllTripsService = exports.bookedTripService = exports.createTripService = void 0;
const booking_model_1 = require("./booking.model");
const cloudinary_1 = require("../../utils/cloudinary");
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const constants_1 = require("../../helpers/constants");
const booked_trip_model_1 = require("./booked_trip.model");
const payment_model_1 = require("./payment.model");
const user_model_1 = __importDefault(require("../users/user.model"));
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
const bookedTripService = (tripData, files) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let documentUrls = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                const uploadResult = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'trip-documents');
                return uploadResult.secure_url;
            }));
            documentUrls = yield Promise.all(uploadPromises);
        }
        const trip = new booked_trip_model_1.BookedTrip(Object.assign(Object.assign({}, tripData), { documents: documentUrls }));
        return yield trip.save();
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to create trip',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.bookedTripService = bookedTripService;
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
const getAllTripsHistoryService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 5, userId) {
    try {
        const skip = (page - 1) * limit;
        // const trips = await Trip.find({
        //     userId: userId,
        //     creator: { $in: ["", null] },
        // })
        //     .sort({ createdAt: -1 })
        //     .skip(skip)
        //     .limit(limit)
        //     .lean();
        const tripss = yield payment_model_1.Payment.find({
            userId: userId,
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const adminTrips = [];
        for (const trip of tripss) {
            const bookedDetails = yield booked_trip_model_1.BookedTrip.findOne({
                _id: trip.tripId
            }).populate("tripId");
            if (bookedDetails) {
                adminTrips.push(bookedDetails);
            }
            const tripDetails = yield booking_model_1.Trip.findOne({
                _id: trip.tripId
            });
            if (tripDetails) {
                adminTrips.push(tripDetails);
            }
        }
        const total = yield booking_model_1.Trip.countDocuments();
        const pages = Math.ceil(total / limit);
        return { trips: adminTrips, total, pages };
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
const getRecentBookedTripsService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10, userId) {
    try {
        const skip = (page - 1) * limit;
        const query = userId ? { userId } : {};
        const bookings = yield booked_trip_model_1.BookedTrip.find(query)
            .populate('tripId', 'name destination')
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = yield booked_trip_model_1.BookedTrip.countDocuments(query);
        const pages = Math.ceil(total / limit);
        return { bookings, total, pages };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message || 'Failed to fetch recent booked trips',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getRecentBookedTripsService = getRecentBookedTripsService;
const analyticsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const [totalEvents, totalUsers, totalTrips, totalPayments] = yield Promise.all([
        booking_model_1.Trip.countDocuments(),
        user_model_1.default.countDocuments(),
        booked_trip_model_1.BookedTrip.countDocuments(),
        payment_model_1.Payment.countDocuments(),
    ]);
    return {
        totalEvents,
        totalUsers,
        totalTrips,
        totalPayments,
    };
});
exports.analyticsService = analyticsService;

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
exports.getTripsByStatusController = exports.deleteTripController = exports.updateTripController = exports.getTripByIdController = exports.getAllTripsHistoryController = exports.getAllTripsController = exports.createTripController = void 0;
const http_status_codes_1 = require("http-status-codes");
const booking_service_1 = require("./booking.service");
const createTripController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.file ? [req.file] : undefined;
    const payload = Object.assign(Object.assign({}, req.body), { userId: req['user']._id });
    const trip = yield (0, booking_service_1.createTripService)(payload, files);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        msg: "Trip created successfully",
        data: trip,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.createTripController = createTripController;
const getAllTripsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req['user']._id;
    const result = yield (0, booking_service_1.getAllTripsService)(page, limit, userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Trips fetched successfully",
        data: result,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getAllTripsController = getAllTripsController;
const getAllTripsHistoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req['user']._id;
    const result = yield (0, booking_service_1.getAllTripsHistoryService)(page, limit, userId);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Trips fetched successfully",
        data: result,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getAllTripsHistoryController = getAllTripsHistoryController;
const getTripByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const trip = yield (0, booking_service_1.getTripByIdService)(id);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Trip fetched successfully",
        data: trip,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getTripByIdController = getTripByIdController;
const updateTripController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const files = req.files;
    const trip = yield (0, booking_service_1.updateTripService)(id, req.body, files);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Trip updated successfully",
        data: trip,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.updateTripController = updateTripController;
const deleteTripController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield (0, booking_service_1.deleteTripService)(id);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Trip deleted successfully",
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: []
    });
});
exports.deleteTripController = deleteTripController;
const getTripsByStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = yield (0, booking_service_1.getTripsByStatusService)(status, page, limit);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "Trips fetched successfully",
        data: result,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.getTripsByStatusController = getTripsByStatusController;

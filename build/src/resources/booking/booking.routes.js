"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("./booking.controller");
const documentUpload_1 = require("../../middlewares/documentUpload");
const middlewares_1 = require("../../middlewares");
const router = (0, express_1.Router)();
/**
 * @route POST /api/trips
 * @desc Create a new trip with optional document uploads
 * @access Private
 */
router.post('/', middlewares_1.authenticate, documentUpload_1.documentUpload.single('document'), booking_controller_1.createTripController);
/**
 * @route GET /api/trips
 * @desc Get all trips with pagination
 * @access Private
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 */
router.get('/', middlewares_1.authenticate, booking_controller_1.getAllTripsController);
/**
 * @route GET /api/trips/:id
 * @desc Get trip by ID
 * @access Private
 */
router.get('/:id', middlewares_1.authenticate, booking_controller_1.getTripByIdController);
/**
 * @route PUT /api/trips/:id
 * @desc Update trip by ID with optional additional document uploads
 * @access Private
 */
router.put('/:id', middlewares_1.authenticate, documentUpload_1.documentUpload.array('documents', 10), booking_controller_1.updateTripController);
/**
 * @route DELETE /api/trips/:id
 * @desc Delete trip by ID
 * @access Private
 */
router.delete('/:id', middlewares_1.authenticate, booking_controller_1.deleteTripController);
/**
 * @route GET /api/trips/status/:status
 * @desc Get trips by status with pagination
 * @access Private
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 */
router.get('/status/:status', middlewares_1.authenticate, booking_controller_1.getTripsByStatusController);
exports.default = {
    path: "/trip",
    router: router
};

import { Router } from 'express';
import {
    createTripController,
    getAllTripsController,
    getTripByIdController,
    updateTripController,
    deleteTripController,
    getTripsByStatusController
} from './booking.controller';
import { documentUpload } from '../../middlewares/documentUpload';
import {authenticate} from "../../middlewares";

const router = Router();

/**
 * @route POST /api/trips
 * @desc Create a new trip with optional document uploads
 * @access Private
 */
router.post('/',authenticate, documentUpload.single('document'), createTripController);

/**
 * @route GET /api/trips
 * @desc Get all trips with pagination
 * @access Private
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 */
router.get('/',authenticate, getAllTripsController);

/**
 * @route GET /api/trips/:id
 * @desc Get trip by ID
 * @access Private
 */
router.get('/:id',authenticate, getTripByIdController);

/**
 * @route PUT /api/trips/:id
 * @desc Update trip by ID with optional additional document uploads
 * @access Private
 */
router.put('/:id',authenticate, documentUpload.array('documents', 10), updateTripController);

/**
 * @route DELETE /api/trips/:id
 * @desc Delete trip by ID
 * @access Private
 */
router.delete('/:id',authenticate, deleteTripController);

/**
 * @route GET /api/trips/status/:status
 * @desc Get trips by status with pagination
 * @access Private
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10)
 */
router.get('/status/:status',authenticate, getTripsByStatusController);

export default {
    path:"/trip",
    router:router
};
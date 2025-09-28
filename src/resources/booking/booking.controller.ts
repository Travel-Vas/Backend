import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    createTripService,
    getTripByIdService,
    updateTripService,
    deleteTripService,
    getTripsByStatusService, getAllTripsHistoryService, getAllTripsService, bookedTripService, analyticsService, getRecentBookedTripsService
} from './booking.service';
import { CustomResponse } from '../../helpers/lib/App';
import { createNotificationForAdmins } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';

export const createTripController = async (req: Request, res: CustomResponse<any>) => {
        const files = req.file ? [req.file] : undefined;
        const payload = {
            ...req.body,
            userId: req['user']._id,
            creator:"Admin",
        };

        const trip = await createTripService(payload, files);
        
        await createNotificationForAdmins({
            type: NotificationType.TRIP_CREATED,
            title: 'New Trip Created',
            message: `A new trip "${trip.name}" to ${trip.destination} has been created by ${req['user'].name}`,
            userId: req['user']._id,
            tripId: (trip as any)._id.toString(),
            metadata: {
                tripName: trip.name,
                destination: trip.destination,
                startDate: trip.startDate,
                endDate: trip.endDate,
                createdBy: req['user'].name
            }
        });
        
        res.status(StatusCodes.CREATED).json({
            msg: "Trip created successfully",
            data: trip,
            statusCode: StatusCodes.CREATED
        });
};
export const bookTripController = async (req: Request, res: CustomResponse<any>) => {
    const files = req.file ? [req.file] : undefined;
    const payload = {
        ...req.body,
        userId: req['user']._id
    };

    const trip = await bookedTripService(payload, files);
    
    await createNotificationForAdmins({
        type: NotificationType.TRIP_BOOKED,
        title: 'New Trip Booking',
        message: `${req['user'].name} has booked a trip to ${trip.destination}`,
        userId: req['user']._id,
        bookingId: (trip as any)._id.toString(),
        tripId: payload.tripId,
        metadata: {
            customerName: `${trip.firstName} ${trip.lastName}`,
            customerEmail: trip.email,
            customerPhone: trip.phoneNumber,
            destination: trip.destination,
            tripName: trip.name,
            tripCost: trip.tripCost,
            startDate: trip.startDate,
            endDate: trip.endDate,
            bookedBy: req['user'].name
        }
    });

    res.status(StatusCodes.CREATED).json({
        msg: "Trip booked successfully",
        data: trip,
        statusCode: StatusCodes.CREATED
    });
};
export const getAllTripsController = async (req: Request, res: CustomResponse<any>) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const userId = req['user']._id
        
        const result = await getAllTripsService(page, limit, userId);
        
        res.status(StatusCodes.OK).json({
            msg: "Trips fetched successfully",
            data: result,
            statusCode: StatusCodes.OK
        });
};

export const getAllTripsHistoryController = async (req: Request, res: CustomResponse<any>) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req['user']._id

    const result = await getAllTripsHistoryService(page, limit, userId);

    res.status(StatusCodes.OK).json({
        msg: "Trips fetched successfully",
        data: result,
        statusCode: StatusCodes.OK
    });
};

export const getTripByIdController = async (req: Request, res: CustomResponse<any>) => {
        const { id } = req.params;
        const trip = await getTripByIdService(id);
        
        res.status(StatusCodes.OK).json({
            msg: "Trip fetched successfully",
            data: trip,
            statusCode: StatusCodes.OK
        });
};

export const updateTripController = async (req: Request, res: CustomResponse<any>) => {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];
        const trip = await updateTripService(id, req.body, files);
        
        res.status(StatusCodes.OK).json({
            msg: "Trip updated successfully",
            data: trip,
            statusCode: StatusCodes.OK
        });
};

export const deleteTripController = async (req: Request, res: CustomResponse<any>) => {
        const { id } = req.params;
        await deleteTripService(id);
        
        res.status(StatusCodes.OK).json({
            msg: "Trip deleted successfully",
            statusCode: StatusCodes.OK,
            data: []
        });
};

export const getTripsByStatusController = async (req: Request, res: CustomResponse<any>) => {
        const { status } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const result = await getTripsByStatusService(status, page, limit);
        
        res.status(StatusCodes.OK).json({
            msg: "Trips fetched successfully",
            data: result,
            statusCode: StatusCodes.OK
        });

};
export const getRecentBookedTripsController = async (req: Request, res: CustomResponse<any>) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId as string;
    
    const result = await getRecentBookedTripsService(page, limit, userId);
    
    res.status(StatusCodes.OK).json({
        msg: "Recent booked trips fetched successfully",
        data: result,
        statusCode: StatusCodes.OK
    });
};

export const analyticsController = async (req: Request, res: CustomResponse<any>) => {
    const response = await analyticsService()
    res.status(StatusCodes.OK).json({
        msg: "Statistics fetched successfully",
        data: response,
        statusCode: StatusCodes.OK
    });
}
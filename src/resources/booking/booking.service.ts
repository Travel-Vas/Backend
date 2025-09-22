import { Trip, ITripDocument } from './booking.model';
import { ITrip } from './booking.interface';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { CustomError } from '../../helpers/lib/App';
import { StatusCodes } from 'http-status-codes';
import {UserRole} from "../../helpers/constants";
import {BookedTrip} from "./booked_trip.model";
import {Payment} from "./payment.model";
import UserModel from "../users/user.model";

export const createTripService = async (tripData: Partial<ITrip>, files?: Express.Multer.File[]): Promise<ITripDocument> => {
    try {
        let documentUrls: string[] = [];

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const uploadResult = await uploadToCloudinary(file.buffer, 'trip-documents');
                return uploadResult.secure_url;
            });
            documentUrls = await Promise.all(uploadPromises);
        }

        const trip = new Trip({
            ...tripData,
            documents: documentUrls
        });

        return await trip.save();
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to create trip',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const bookedTripService = async (tripData: Partial<ITrip>, files?: Express.Multer.File[]): Promise<ITripDocument> => {
    try {
        let documentUrls: string[] = [];

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const uploadResult = await uploadToCloudinary(file.buffer, 'trip-documents');
                return uploadResult.secure_url;
            });
            documentUrls = await Promise.all(uploadPromises);
        }

        const trip = new BookedTrip({
            ...tripData,
            documents: documentUrls,
        });

        return await trip.save();
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to create trip',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const getAllTripsService = async (page: number = 1, limit: number = 10, userId:any): Promise<{ trips: ITripDocument[], total: number, pages: number }> => {
    try {
        const skip = (page - 1) * limit;
        const trips = await Trip.find({
            creator: UserRole.ADMIN
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Trip.countDocuments();
        const pages = Math.ceil(total / limit);

        return { trips, total, pages };
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to fetch trips',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};
export const getAllTripsHistoryService = async (page: number = 1, limit: number = 5, userId:any): Promise<{ trips: any[], total: number, pages: number }> => {
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
        const tripss = await Payment.find({
                userId: userId,
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const adminTrips:any = []
        for(const trip of tripss) {
            const bookedDetails = await BookedTrip.findOne({
                _id: trip.tripId
            }).populate("tripId")
            if(bookedDetails){
                adminTrips.push(bookedDetails)
            }
            const tripDetails = await Trip.findOne({
                _id: trip.tripId
            })
            adminTrips.push(tripDetails)
        }
        const total = await Trip.countDocuments();
        const pages = Math.ceil(total / limit);

        return { trips:adminTrips, total, pages };
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to fetch trips',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const getTripByIdService = async (tripId: string): Promise<ITripDocument> => {
    try {
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
            throw new CustomError({
                message: 'Trip not found',
                code: StatusCodes.NOT_FOUND
            });
        }

        return trip;
    } catch (error: any) {
        if (error instanceof CustomError) throw error;
        throw new CustomError({
            message: error.message || 'Failed to fetch trip',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const updateTripService = async (tripId: string, updateData: Partial<ITrip>, files?: Express.Multer.File[]): Promise<ITripDocument> => {
    try {
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
            throw new CustomError({
                message: 'Trip not found',
                code: StatusCodes.NOT_FOUND
            });
        }

        let documentUrls: string[] = trip.documents || [];

        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                const uploadResult = await uploadToCloudinary(file.buffer, 'trip-documents');
                return uploadResult.secure_url;
            });
            const newUrls = await Promise.all(uploadPromises);
            documentUrls = [...documentUrls, ...newUrls];
        }

        const updatedTrip = await Trip.findByIdAndUpdate(
            tripId,
            { ...updateData, documents: documentUrls },
            { new: true, runValidators: true }
        );

        return updatedTrip!;
    } catch (error: any) {
        if (error instanceof CustomError) throw error;
        throw new CustomError({
            message: error.message || 'Failed to update trip',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const deleteTripService = async (tripId: string): Promise<void> => {
    try {
        const trip = await Trip.findById(tripId);
        
        if (!trip) {
            throw new CustomError({
                message: 'Trip not found',
                code: StatusCodes.NOT_FOUND
            });
        }

        await Trip.findByIdAndDelete(tripId);
    } catch (error: any) {
        if (error instanceof CustomError) throw error;
        throw new CustomError({
            message: error.message || 'Failed to delete trip',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const getTripsByStatusService = async (status: string, page: number = 1, limit: number = 10): Promise<{ trips: ITripDocument[], total: number, pages: number }> => {
    try {
        const skip = (page - 1) * limit;
        const trips = await Trip.find({ status })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await Trip.countDocuments({ status });
        const pages = Math.ceil(total / limit);

        return { trips, total, pages };
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to fetch trips by status',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};
export const analyticsService = async () => {
    const [totalEvents, totalUsers, totalTrips, totalPayments] = await Promise.all([
        Trip.countDocuments(),
        UserModel.countDocuments(),
        BookedTrip.countDocuments(),
        Payment.countDocuments(),
    ]);

    return {
        totalEvents,
        totalUsers,
        totalTrips,
        totalPayments,
    };
};

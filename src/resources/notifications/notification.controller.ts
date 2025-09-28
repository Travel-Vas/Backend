import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomResponse } from '../../helpers/lib/App';
import {
    getNotificationsForUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from './notification.service';
import { NotificationStatus } from './notification.model';

export const getNotificationsController = async (req: Request, res: CustomResponse<any>) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as NotificationStatus;
    const userId = req['user']._id;
    
    const result = await getNotificationsForUser(userId, page, limit, status);
    
    res.status(StatusCodes.OK).json({
        msg: "Notifications fetched successfully",
        data: result,
        statusCode: StatusCodes.OK
    });
};

export const markNotificationAsReadController = async (req: Request, res: CustomResponse<any>) => {
    const { id } = req.params;
    const userId = req['user']._id;
    
    const notification = await markNotificationAsRead(id, userId);
    
    res.status(StatusCodes.OK).json({
        msg: "Notification marked as read",
        data: notification,
        statusCode: StatusCodes.OK
    });
};

export const markAllAsReadController = async (req: Request, res: CustomResponse<any>) => {
    const userId = req['user']._id;
    
    await markAllNotificationsAsRead(userId);
    
    res.status(StatusCodes.OK).json({
        msg: "All notifications marked as read",
        data: null,
        statusCode: StatusCodes.OK
    });
};

export const deleteNotificationController = async (req: Request, res: CustomResponse<any>) => {
    const { id } = req.params;
    const userId = req['user']._id;
    
    await deleteNotification(id, userId);
    
    res.status(StatusCodes.OK).json({
        msg: "Notification deleted successfully",
        data: null,
        statusCode: StatusCodes.OK
    });
};
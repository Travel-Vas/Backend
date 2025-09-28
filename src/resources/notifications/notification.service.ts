import { Notification, INotificationDocument, NotificationType, NotificationStatus } from './notification.model';
import UserModel from '../users/user.model';
import { CustomError } from '../../helpers/lib/App';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../../helpers/constants';

interface CreateNotificationData {
    type: NotificationType;
    title: string;
    message: string;
    userId?: string;
    tripId?: string;
    bookingId?: string;
    metadata?: Record<string, any>;
}

export const createNotificationForAdmins = async (data: CreateNotificationData): Promise<void> => {
    try {
        const admins = await UserModel.find({ role: UserRole.ADMIN }).select('_id');
        
        if (admins.length === 0) {
            console.warn('No admin users found to send notifications');
            return;
        }

        const notifications = admins.map(admin => ({
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId,
            tripId: data.tripId,
            bookingId: data.bookingId,
            recipientId: admin._id,
            recipientRole: UserRole.ADMIN,
            status: NotificationStatus.UNREAD,
            metadata: data.metadata
        }));

        await Notification.insertMany(notifications);
    } catch (error: any) {
        console.error('Error creating notifications for admins:', error);
        throw new CustomError({
            message: 'Failed to create notifications',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const createNotificationForUser = async (
    recipientId: string,
    data: CreateNotificationData
): Promise<INotificationDocument> => {
    try {
        const user = await UserModel.findById(recipientId);
        if (!user) {
            throw new CustomError({
                message: 'Recipient user not found',
                code: StatusCodes.NOT_FOUND
            });
        }

        const notification = new Notification({
            type: data.type,
            title: data.title,
            message: data.message,
            userId: data.userId,
            tripId: data.tripId,
            bookingId: data.bookingId,
            recipientId: recipientId,
            recipientRole: user.role,
            status: NotificationStatus.UNREAD,
            metadata: data.metadata
        });

        return await notification.save();
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to create notification',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const getNotificationsForUser = async (
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: NotificationStatus
): Promise<{ notifications: INotificationDocument[], total: number, pages: number, unreadCount: number }> => {
    try {
        const skip = (page - 1) * limit;
        const query: any = { recipientId: userId };
        
        if (status) {
            query.status = status;
        }

        const notifications = await Notification.find(query)
            .populate('userId', 'firstName lastName email')
            .populate('tripId', 'name destination')
            .populate('bookingId', 'name destination')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ 
            recipientId: userId, 
            status: NotificationStatus.UNREAD 
        });
        const pages = Math.ceil(total / limit);

        return { notifications, total, pages, unreadCount };
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to fetch notifications',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const markNotificationAsRead = async (
    notificationId: string,
    userId: string
): Promise<INotificationDocument> => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { 
                _id: notificationId,
                recipientId: userId 
            },
            { 
                status: NotificationStatus.READ,
                readAt: new Date()
            },
            { new: true }
        );

        if (!notification) {
            throw new CustomError({
                message: 'Notification not found',
                code: StatusCodes.NOT_FOUND
            });
        }

        return notification;
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to mark notification as read',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    try {
        await Notification.updateMany(
            { 
                recipientId: userId,
                status: NotificationStatus.UNREAD
            },
            { 
                status: NotificationStatus.READ,
                readAt: new Date()
            }
        );
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to mark all notifications as read',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};

export const deleteNotification = async (
    notificationId: string,
    userId: string
): Promise<void> => {
    try {
        const result = await Notification.deleteOne({
            _id: notificationId,
            recipientId: userId
        });

        if (result.deletedCount === 0) {
            throw new CustomError({
                message: 'Notification not found',
                code: StatusCodes.NOT_FOUND
            });
        }
    } catch (error: any) {
        throw new CustomError({
            message: error.message || 'Failed to delete notification',
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
};
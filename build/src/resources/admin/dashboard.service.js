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
exports.DashboardService = void 0;
class DashboardService {
    static getDashboardStats(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dateFilter = this.getDateFilter(filter === null || filter === void 0 ? void 0 : filter.period);
                // This would typically aggregate data from your booking and user collections
                // For now, returning mock data - replace with actual database queries
                const stats = {
                    totalBookings: 156,
                    totalUsers: 89,
                    totalRevenue: 45680.50,
                    activeTrips: 12,
                    pendingBookings: 8,
                    confirmedBookings: 125,
                    cancelledBookings: 23,
                    monthlyRevenue: 12450.00,
                    recentBookings: yield this.getRecentBookings()
                };
                return stats;
            }
            catch (error) {
                throw new Error(`Failed to fetch dashboard stats: ${error}`);
            }
        });
    }
    static getRevenueChart(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const period = (filter === null || filter === void 0 ? void 0 : filter.period) || 'month';
                // Mock data - replace with actual revenue aggregation
                const chart = {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    data: [3500, 4200, 3800, 5100, 4700, 6200],
                    period
                };
                return chart;
            }
            catch (error) {
                throw new Error(`Failed to fetch revenue chart: ${error}`);
            }
        });
    }
    static getBookingStatusChart() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Mock data - replace with actual booking status aggregation
                const chart = {
                    pending: 8,
                    confirmed: 125,
                    cancelled: 23,
                    completed: 89
                };
                return chart;
            }
            catch (error) {
                throw new Error(`Failed to fetch booking status chart: ${error}`);
            }
        });
    }
    static getRecentBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock data - replace with actual database query
            return [
                {
                    _id: '60a5f1234567890123456789',
                    customerName: 'John Doe',
                    customerEmail: 'john@example.com',
                    tripTitle: 'Tropical Paradise',
                    destination: 'Bali, Indonesia',
                    totalAmount: 1250.00,
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    bookingDate: new Date()
                },
                {
                    _id: '60a5f1234567890123456790',
                    customerName: 'Jane Smith',
                    customerEmail: 'jane@example.com',
                    tripTitle: 'Mountain Adventure',
                    destination: 'Swiss Alps',
                    totalAmount: 2100.00,
                    status: 'pending',
                    paymentStatus: 'pending',
                    bookingDate: new Date()
                }
            ];
        });
    }
    static getDateFilter(period) {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        switch (period) {
            case 'today':
                return {
                    start: startOfDay,
                    end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
                };
            case 'week':
                const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000));
                return {
                    start: startOfWeek,
                    end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
                };
            case 'month':
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                };
            case 'year':
                return {
                    start: new Date(now.getFullYear(), 0, 1),
                    end: new Date(now.getFullYear() + 1, 0, 1)
                };
            default:
                return {
                    start: new Date(now.getFullYear(), now.getMonth(), 1),
                    end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                };
        }
    }
}
exports.DashboardService = DashboardService;

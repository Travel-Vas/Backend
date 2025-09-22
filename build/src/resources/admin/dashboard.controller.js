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
exports.DashboardController = void 0;
const express_validator_1 = require("express-validator");
const dashboard_service_1 = require("./dashboard.service");
class DashboardController {
    static getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: errors.array()
                    });
                    return;
                }
                const filter = {
                    period: req.query.period,
                    startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                    endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
                };
                const stats = yield dashboard_service_1.DashboardService.getDashboardStats(filter);
                res.status(200).json({
                    success: true,
                    message: 'Dashboard stats retrieved successfully',
                    data: stats
                });
            }
            catch (error) {
                console.error('Error fetching dashboard stats:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch dashboard stats'
                });
            }
        });
    }
    static getRevenueChart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: errors.array()
                    });
                    return;
                }
                const filter = {
                    period: req.query.period
                };
                const chart = yield dashboard_service_1.DashboardService.getRevenueChart(filter);
                res.status(200).json({
                    success: true,
                    message: 'Revenue chart data retrieved successfully',
                    data: chart
                });
            }
            catch (error) {
                console.error('Error fetching revenue chart:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch revenue chart data'
                });
            }
        });
    }
    static getBookingStatusChart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chart = yield dashboard_service_1.DashboardService.getBookingStatusChart();
                res.status(200).json({
                    success: true,
                    message: 'Booking status chart data retrieved successfully',
                    data: chart
                });
            }
            catch (error) {
                console.error('Error fetching booking status chart:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch booking status chart data'
                });
            }
        });
    }
}
exports.DashboardController = DashboardController;
DashboardController.validateDashboardQuery = [
    (0, express_validator_1.query)('period')
        .optional()
        .isIn(['today', 'week', 'month', 'year'])
        .withMessage('Period must be one of: today, week, month, year'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
];

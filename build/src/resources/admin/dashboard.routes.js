"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
// import { authenticateToken } from '../../middleware/auth';
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
exports.dashboardRoutes = router;
// All dashboard routes require authentication
// router.use(authenticateToken);
// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboard_controller_1.DashboardController.validateDashboardQuery, dashboard_controller_1.DashboardController.getDashboardStats);
// GET /api/dashboard/revenue-chart - Get revenue chart data
router.get('/revenue-chart', dashboard_controller_1.DashboardController.validateDashboardQuery, dashboard_controller_1.DashboardController.getRevenueChart);
// GET /api/dashboard/booking-status-chart - Get booking status chart data
router.get('/booking-status-chart', dashboard_controller_1.DashboardController.getBookingStatusChart);

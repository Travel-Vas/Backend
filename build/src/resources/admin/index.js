"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = exports.DashboardController = exports.dashboardRoutes = void 0;
var dashboard_routes_1 = require("./dashboard.routes");
Object.defineProperty(exports, "dashboardRoutes", { enumerable: true, get: function () { return dashboard_routes_1.dashboardRoutes; } });
var dashboard_controller_1 = require("./dashboard.controller");
Object.defineProperty(exports, "DashboardController", { enumerable: true, get: function () { return dashboard_controller_1.DashboardController; } });
var dashboard_service_1 = require("./dashboard.service");
Object.defineProperty(exports, "DashboardService", { enumerable: true, get: function () { return dashboard_service_1.DashboardService; } });
__exportStar(require("./dashboard.interface"), exports);

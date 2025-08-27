"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_router_1 = __importDefault(require("../resources/users/user.router"));
const settings_routes_1 = __importDefault(require("../resources/settings/settings.routes"));
const booking_routes_1 = __importDefault(require("../resources/booking/booking.routes"));
const payment_routes_1 = __importDefault(require("../resources/booking/payment.routes"));
exports.default = [
    user_router_1.default,
    settings_routes_1.default,
    booking_routes_1.default,
    payment_routes_1.default
];

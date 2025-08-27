"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const analytics_controller_1 = require("./analytics.controller");
const constants_1 = require("../../helpers/constants");
const router = (0, express_1.Router)();
router.get('/vendor', middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.VENDOR), analytics_controller_1.vendorAggregateController);
exports.default = { path: '/analytics', router };

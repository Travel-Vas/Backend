"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shoots_controller_1 = __importDefault(require("./shoots.controller"));
const authenticate_middleware_1 = require("../../middlewares/authenticate.middleware");
const router = (0, express_1.Router)();
const shootsController = new shoots_controller_1.default();
router.get('/', authenticate_middleware_1.authenticate, shootsController.getShoots);
router.get('/:id', authenticate_middleware_1.authenticate, shootsController.getShoot);
router.post('/', authenticate_middleware_1.authenticate, shootsController.createShoot);
router.put('/:id', authenticate_middleware_1.authenticate, shootsController.updateShoot);
router.delete('/:id', authenticate_middleware_1.authenticate, shootsController.deleteShoot);
exports.default = router;

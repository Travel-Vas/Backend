"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clients_controller_1 = __importDefault(require("./clients.controller"));
const authenticate_middleware_1 = require("../../middlewares/authenticate.middleware");
const router = (0, express_1.Router)();
const clientsController = new clients_controller_1.default();
router.get('/', authenticate_middleware_1.authenticate, clientsController.getClients);
router.get('/:id', authenticate_middleware_1.authenticate, clientsController.getClient);
router.post('/', authenticate_middleware_1.authenticate, clientsController.createClient);
router.put('/:id', authenticate_middleware_1.authenticate, clientsController.updateClient);
router.delete('/:id', authenticate_middleware_1.authenticate, clientsController.deleteClient);
exports.default = router;

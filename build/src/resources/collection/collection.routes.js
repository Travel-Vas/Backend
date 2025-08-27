"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collection_controller_1 = __importDefault(require("./collection.controller"));
const authenticate_middleware_1 = require("../../middlewares/authenticate.middleware");
const router = (0, express_1.Router)();
const collectionController = new collection_controller_1.default();
router.get('/', authenticate_middleware_1.authenticate, collectionController.getCollections);
router.get('/:id', authenticate_middleware_1.authenticate, collectionController.getCollection);
router.post('/', authenticate_middleware_1.authenticate, collectionController.createCollection);
router.put('/:id', authenticate_middleware_1.authenticate, collectionController.updateCollection);
router.delete('/:id', authenticate_middleware_1.authenticate, collectionController.deleteCollection);
exports.default = router;

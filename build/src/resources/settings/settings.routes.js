"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../../middlewares");
const user_router_1 = require("../users/user.router");
const settings_controller_1 = require("./settings.controller");
const router = express_1.default.Router();
const shootUploads = user_router_1.upload.fields([
    { name: 'water_mark', maxCount: 1 },
]);
router.get('/', middlewares_1.authenticate, settings_controller_1.getSettingsDetails);
exports.default = {
    path: '/settings',
    router: router,
};

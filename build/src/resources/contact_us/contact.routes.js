"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("./contact.controller");
const router = express_1.default.Router();
router.post("/", contact_controller_1.contactController);
exports.default = {
    path: "/contact-us",
    router: router,
};

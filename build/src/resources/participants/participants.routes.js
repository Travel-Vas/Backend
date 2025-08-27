"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const participants_controller_1 = require("./participants.controller");
const router = express_1.default.Router();
router.post("/register", participants_controller_1._participantsController);
router.post("/login", participants_controller_1._participantsLoginController);
router.get("/:id", participants_controller_1._participantsProfileController);
router.delete("/", participants_controller_1._participantsDeleteController);
router.get("/", participants_controller_1._allParticipants);
exports.default = { router: router, path: "/participants" };

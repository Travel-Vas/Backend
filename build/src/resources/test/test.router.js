"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const test_controller_1 = require("./test.controller");
const router = express_1.default.Router();
router.post("/create", test_controller_1.testController);
router.get("/", test_controller_1.testRecords);
router.delete("/", test_controller_1.deleteRecord);
router.get("/single", test_controller_1.testRecord);
router.get("/recyclebin", test_controller_1.recycleBin);
router.get("/emptybin", test_controller_1.emptyeBin);
exports.default = { router, path: "/records" };

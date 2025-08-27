"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsValidationSchema = exports.clientIdSchema = exports.updateClientSchema = exports.createClientSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createClientSchema = joi_1.default.object({
    name: joi_1.default.string().required().trim().min(2).max(100),
    email: joi_1.default.string().email().required().trim().lowercase(),
    phone: joi_1.default.string().optional().trim(),
    address: joi_1.default.string().optional().trim(),
});
exports.updateClientSchema = joi_1.default.object({
    name: joi_1.default.string().optional().trim().min(2).max(100),
    email: joi_1.default.string().email().optional().trim().lowercase(),
    phone: joi_1.default.string().optional().trim(),
    address: joi_1.default.string().optional().trim(),
});
exports.clientIdSchema = joi_1.default.object({
    id: joi_1.default.string().required().hex().length(24),
});
// Simple settingsValidationSchema stub
exports.settingsValidationSchema = joi_1.default.object({
// Add validation rules as needed
});

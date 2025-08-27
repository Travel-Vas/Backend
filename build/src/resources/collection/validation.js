"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.collectionIdSchema = exports.updateCollectionSchema = exports.createCollectionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createCollectionSchema = joi_1.default.object({
    name: joi_1.default.string().required().trim().min(2).max(100),
    description: joi_1.default.string().optional().trim().max(500),
    images: joi_1.default.array().items(joi_1.default.string()).optional(),
});
exports.updateCollectionSchema = joi_1.default.object({
    name: joi_1.default.string().optional().trim().min(2).max(100),
    description: joi_1.default.string().optional().trim().max(500),
    images: joi_1.default.array().items(joi_1.default.string()).optional(),
});
exports.collectionIdSchema = joi_1.default.object({
    id: joi_1.default.string().required().hex().length(24),
});
// Simple validate function stub
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ msg: error.details[0].message });
        }
        next();
    };
};
exports.validate = validate;

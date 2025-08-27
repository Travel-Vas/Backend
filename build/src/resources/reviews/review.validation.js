"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createReviewSchema = joi_1.default.object({
    product: joi_1.default.string().required(),
    comment: joi_1.default.string().required(),
    rating: joi_1.default.number().required()
});

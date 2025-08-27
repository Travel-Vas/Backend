"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItemToCartSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addItemToCartSchema = joi_1.default.object({
    product_id: joi_1.default.string().required(),
    quantity: joi_1.default.number().default(1).min(0),
    variation: joi_1.default.object()
});

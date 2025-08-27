"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProductSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the schema for IDiscount
const discountSchema = joi_1.default.object({
    percentage: joi_1.default.number().required(),
    startDate: joi_1.default.string().isoDate().required(),
    endDate: joi_1.default.string().isoDate().required(),
});
// Define the schema for IDimension
const dimensionSchema = joi_1.default.object({
    height: joi_1.default.number().required(),
    width: joi_1.default.number().required(),
    depth: joi_1.default.number().required(),
});
// Define the schema for IVariants
const variantsSchema = joi_1.default.object({
    color: joi_1.default.string().required(),
    size: joi_1.default.string().required(),
});
// Define the schema for IProduct
exports.addProductSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    price: joi_1.default.number().required(),
    stock: joi_1.default.number().required(),
    discount: discountSchema,
    delivery_cost: joi_1.default.number(),
    category: joi_1.default.string().required(),
    // variants: Joi.array().items(variantsSchema),
    dimensions: dimensionSchema,
    brand: joi_1.default.string(),
    tags: joi_1.default.array().items(joi_1.default.string()),
    weight: joi_1.default.string(),
});

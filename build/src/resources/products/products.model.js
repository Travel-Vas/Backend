"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewModel = void 0;
const mongoose_1 = require("mongoose");
const slugify_1 = __importDefault(require("slugify"));
const utils_1 = require("../../helpers/lib/App/utils");
const timeStamps = {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: "updated_at"
    }
};
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'name of product is required'],
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: [true, 'price is required']
    },
    stock: {
        type: Number,
        default: 1
    },
    discount: {
        percentage: Number,
        startDate: String,
        endDate: String,
    },
    delivery_cost: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    category: {
        type: String, //make this a string
        ref: 'Category'
    },
    slug: String,
    images: [String],
    vendor: {
        required: [true, 'vendor is required'],
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    variants: [{
            color: String,
            size: String,
            variation_images: [String]
        }],
    dimensions: {
        height: Number,
        width: Number,
        depth: Number,
    },
    brand: String,
    tags: [String],
    weight: String
}, timeStamps);
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product'
    },
    comment: {
        type: String,
        required: [true, "comment on this product"]
    },
    rating: {
        type: Number,
        required: [true, "Rate this product"]
    }
}, timeStamps);
productSchema.pre('save', function () {
    this.slug = (0, slugify_1.default)(`${this.name} ${(0, utils_1.generateRandom)()}`.toLowerCase(), '_');
});
productSchema.virtual('reviews', {
    ref: 'Review', // The model to populate
    localField: '_id', // The field in the User model
    foreignField: 'product', // The field in the Post model
    // justOne: false, // Set to `true` if you expect only one result, otherwise `false` for multiple results
});
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });
exports.reviewModel = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = (0, mongoose_1.model)('Product', productSchema);

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getProductReviews = exports._createReview = void 0;
const products_model_1 = __importStar(require("../products/products.model"));
const App_1 = require("../../helpers/lib/App");
const _createReview = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isReview = yield products_model_1.reviewModel.findOne({ product: payload.product, user: payload.user });
    if (isReview)
        throw new App_1.CustomError({ message: "You have already dropped your 2 cents on this product." });
    const product = yield products_model_1.default.findOne({ _id: payload.product });
    if (!product)
        throw new App_1.CustomError({ message: "product does not exist", code: 404 });
    const review = new products_model_1.reviewModel(payload);
    yield review.save();
    const productReviewCount = yield products_model_1.reviewModel.find({ product: payload.product }).countDocuments();
    product.rating = (product.rating + payload.rating) / productReviewCount;
    yield product.save();
    return review;
});
exports._createReview = _createReview;
const _getProductReviews = (product_id) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield products_model_1.reviewModel.find({ product: product_id }).populate({
        path: "user",
        select: "full_name profile_image",
    }).select('-updated_at -product -__v');
    return reviews;
});
exports._getProductReviews = _getProductReviews;

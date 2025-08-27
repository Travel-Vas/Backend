"use strict";
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
exports.getReviewController = exports.createReviewController = void 0;
const reviews_service_1 = require("./reviews.service");
const createReviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, reviews_service_1._createReview)(Object.assign(Object.assign({}, req.body), { user: req.user._id }));
    res.status(201).json({ data });
});
exports.createReviewController = createReviewController;
const getReviewController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, reviews_service_1._getProductReviews)(req.params.product_id);
    res.status(200).json({ data, msg: "Successful" });
});
exports.getReviewController = getReviewController;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getAllProducts = exports._getProduct = exports._addProductVariation = exports._addProduct = void 0;
const App_1 = require("../../helpers/lib/App");
const category_model_1 = __importDefault(require("../category/category.model"));
const products_model_1 = __importDefault(require("./products.model"));
const cloudinaryFileUpload_1 = require("../../helpers/lib/App/cloudinaryFileUpload");
const _addProduct = (payload, files, vendor_id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.default.findOne({ name: payload.category });
    if (!category)
        throw new App_1.CustomError({ message: "Category not found", code: 404 });
    const uploadResults = yield Promise.all(files.map(image => (0, cloudinaryFileUpload_1.uploadImage)(image.buffer)));
    const images = uploadResults.map((data) => data.secure_url);
    const product = new products_model_1.default(Object.assign(Object.assign({}, payload), { images, vendor: vendor_id }));
    yield product.save();
    return product;
});
exports._addProduct = _addProduct;
const _addProductVariation = (product_id, payload, files, vendor_id) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield products_model_1.default.findOne({ _id: product_id, vendor: vendor_id });
    if (!product)
        throw new App_1.CustomError({ message: "Product not found", code: 404 });
    const uploadResults = yield Promise.all(files.map(image => (0, cloudinaryFileUpload_1.uploadImage)(image.buffer)));
    const images = uploadResults.map((data) => data.secure_url);
    product.variants.push(Object.assign(Object.assign({}, payload), { variation_images: images }));
    yield product.save();
    return product;
});
exports._addProductVariation = _addProductVariation;
const _getProduct = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield products_model_1.default.findOne({ slug }).populate({
        path: "reviews",
        populate: {
            path: 'user',
            model: 'User',
            select: "full_name profile_image",
        },
        select: "user comment rating created_at"
    });
    if (!product)
        throw new App_1.CustomError({ message: "Not Found", code: 404 });
    return product;
});
exports._getProduct = _getProduct;
const _getAllProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const queryObj = Object.assign({}, query);
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //Advanced Filter
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQueryObj = JSON.parse(queryStr);
    const defaultFilter = { stock: { $gt: 0 } };
    let queryBuilder = products_model_1.default.find(Object.assign(Object.assign({}, parsedQueryObj), defaultFilter));
    //Sort
    if (query.sort) {
        const sortBy = query.sort.split(',').join(' ');
        queryBuilder = queryBuilder.sort(sortBy);
    }
    //select
    if (query.fields) {
        const fields = query.fields.split(',').join(' ');
        queryBuilder = queryBuilder.select(fields);
    }
    //pagination
    let page = (_a = query.page) !== null && _a !== void 0 ? _a : 1;
    let limit = (_b = query.limit) !== null && _b !== void 0 ? _b : 12;
    let skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).limit(limit);
    const products = yield queryBuilder;
    return { length: products.length, products };
});
exports._getAllProducts = _getAllProducts;

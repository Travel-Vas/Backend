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
exports.getProductController = exports.getAllProductsController = exports.addProductController = void 0;
const App_1 = require("../../helpers/lib/App");
const product_service_1 = require("./product.service");
const http_status_codes_1 = require("http-status-codes");
const addProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    if (!files) {
        throw new App_1.CustomError({ message: `image is Required`, code: http_status_codes_1.StatusCodes.BAD_REQUEST });
    }
    if (!files['images']) {
        throw new App_1.CustomError({ message: `image is Required`, code: http_status_codes_1.StatusCodes.BAD_REQUEST });
    }
    const images = files['images'].map(image => {
        return { buffer: image.buffer, mimetype: image.mimetype };
    });
    const data = yield (0, product_service_1._addProduct)(Object.assign(Object.assign({}, req.body), { vendor: req.user._id }), images, req.user._id);
    res.status(200).json({ data, msg: "Successful" });
});
exports.addProductController = addProductController;
const getAllProductsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, product_service_1._getAllProducts)(req.query);
    res.status(200).json({ data });
});
exports.getAllProductsController = getAllProductsController;
const getProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, product_service_1._getProduct)(req.params.slug);
    res.status(200).json({ data });
});
exports.getProductController = getProductController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const middlewares_1 = require("../../middlewares");
const product_validation_1 = require("./product.validation");
const App_1 = require("../../helpers/lib/App");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    console.log('entered here');
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    if (allowedExtensions.indexOf(ext) === -1) {
        return cb(new App_1.CustomError({ message: 'Only images are allowed!', code: 400 }));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({ storage: storage, fileFilter });
const imageUpload = upload.fields([{ name: 'images', maxCount: 5 }]);
router.route('')
    .post(middlewares_1.authenticate, imageUpload, (0, middlewares_1.validationMiddleware)(product_validation_1.addProductSchema), product_controller_1.addProductController) //for vendors alone
    .get(product_controller_1.getAllProductsController);
router.route('/:slug')
    .get(product_controller_1.getProductController);
exports.default = { router, path: '/products' };

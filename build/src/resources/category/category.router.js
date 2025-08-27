"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const middlewares_1 = require("../../middlewares");
const constants_1 = require("../../helpers/constants");
const App_1 = require("../../helpers/lib/App");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    if (allowedExtensions.indexOf(ext) === -1) {
        return cb(new App_1.CustomError({ message: 'Only images are allowed!', code: 400 }));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({ storage: storage, fileFilter });
const imageUpload = upload.fields([{ name: 'cover_image', maxCount: 1 }]);
router.route('')
    .post(middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), imageUpload, (0, middlewares_1.validationMiddleware)(category_validation_1.addCategorySchema), category_controller_1.addCategoryController) //should be accessible by the admin alone
    .get(category_controller_1.getAllCategoryController);
router.route("/:id")
    .delete(middlewares_1.authenticate, (0, middlewares_1.restrictTo)(constants_1.UserRole.ADMIN), category_controller_1.deleteCategoryController);
router.route('/list').get(category_controller_1.getAllCategoryListController);
exports.default = { path: '/category', router };

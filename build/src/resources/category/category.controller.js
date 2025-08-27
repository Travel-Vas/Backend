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
exports.deleteCategoryController = exports.getAllCategoryListController = exports.getAllCategoryController = exports.addCategoryController = void 0;
const category_service_1 = require("./category.service");
const App_1 = require("../../helpers/lib/App");
const addCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    let file = {};
    if (!files || !files["cover_image"])
        throw new App_1.CustomError({ message: "Please Provide a Profile Image" });
    if (files && files['cover_image']) {
        file.buffer = files['cover_image'][0].buffer;
        file.mimetype = files['cover_image'][0].mimetype;
    }
    const data = yield (0, category_service_1._addCategory)(req.body, file);
    res.status(201).json({ data, msg: "successful" });
});
exports.addCategoryController = addCategoryController;
const getAllCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, category_service_1._getAllCategories)();
    res.status(201).json({ data, msg: "successful" });
});
exports.getAllCategoryController = getAllCategoryController;
const getAllCategoryListController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, category_service_1._getAllCategoriesList)();
    res.status(201).json({ data, msg: "successful" });
});
exports.getAllCategoryListController = getAllCategoryListController;
const deleteCategoryController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, category_service_1._deleteCategory)(req.params.id);
    res.status(204).json({ data, msg: "successful" });
});
exports.deleteCategoryController = deleteCategoryController;

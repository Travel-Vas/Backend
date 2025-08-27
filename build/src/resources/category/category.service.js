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
exports._deleteCategory = exports._updateCategory = exports._getAllCategoriesList = exports._getAllCategories = exports._addCategory = void 0;
const App_1 = require("../../helpers/lib/App");
const cloudinaryFileUpload_1 = require("../../helpers/lib/App/cloudinaryFileUpload");
const category_model_1 = __importDefault(require("./category.model"));
const _addCategory = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const nameExist = yield category_model_1.default.findOne({ name: payload.name });
    if (nameExist)
        throw new App_1.CustomError({ message: "This Category Name Already Exist.", code: 400 });
    const uploadResult = yield (0, cloudinaryFileUpload_1.uploadImage)(file.buffer);
    const imageUrl = uploadResult.secure_url;
    const data = new category_model_1.default(Object.assign(Object.assign({}, payload), { cover_image: imageUrl }));
    yield data.save();
    return data;
});
exports._addCategory = _addCategory;
const _getAllCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    return (yield category_model_1.default.find({}));
});
exports._getAllCategories = _getAllCategories;
const _getAllCategoriesList = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield (0, exports._getAllCategories)();
    if (categories.length <= 0)
        return [];
    return categories.map((el) => {
        return el.name;
    });
});
exports._getAllCategoriesList = _getAllCategoriesList;
const _updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield category_model_1.default.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!data)
        throw new App_1.CustomError({ message: "Not Found", code: 404 });
    return data;
});
exports._updateCategory = _updateCategory;
const _deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield category_model_1.default.findByIdAndDelete(id);
    if (!data)
        throw new App_1.CustomError({ message: "Not Found", code: 404 });
});
exports._deleteCategory = _deleteCategory;

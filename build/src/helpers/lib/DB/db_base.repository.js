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
exports.DbRepository = void 0;
const uuid_1 = require("uuid");
const App_1 = require("../App");
const http_status_codes_1 = require("http-status-codes");
class DbRepository {
    constructor(model) {
        this.model = model;
    }
    create(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, projection = {}, saveOptions) {
            try {
                const newData = new this.model(Object.assign(Object.assign({}, data), { uid: (0, uuid_1.v4)() }));
                yield newData.save(saveOptions);
                const savedData = yield this.model.findOne({ _id: newData._id }, projection);
                if (!savedData)
                    throw new App_1.CustomError({ message: http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR });
                return savedData;
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: "Something went wrong", ctx: e });
            }
        });
    }
    createMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newArray = data.map((el) => (Object.assign(Object.assign({}, el), { uid: (0, uuid_1.v4)() })));
                return this.model.insertMany(newArray);
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: "Something went wrong", ctx: e });
            }
        });
    }
    findMany(conditions_1) {
        return __awaiter(this, arguments, void 0, function* (conditions, projection = {}, options = {}) {
            try {
                return yield this.model.find(conditions, projection, options);
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: "Something went wrong", ctx: e });
            }
        });
    }
    findOne(conditions_1) {
        return __awaiter(this, arguments, void 0, function* (conditions, projection = {}, options = {}) {
            try {
                return yield this.model.findOne(conditions, projection, options);
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: "Something Went Wrong", ctx: e });
            }
        });
    }
    findOneAndUpdate(data_1, conditions_1) {
        return __awaiter(this, arguments, void 0, function* (data, 
        // data: Partial<Record<keyof T, unknown>>,
        conditions, projection = {}, options = { new: true, runValidators: true }) {
            try {
                const result = yield this.model
                    .findOneAndUpdate(conditions, data, options)
                    .select(projection);
                return result;
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR, ctx: e });
            }
        });
    }
    findOneAndDelete(conditions_1) {
        return __awaiter(this, arguments, void 0, function* (conditions, projection = {}, options = { new: true, runValidators: true }) {
            try {
                const result = yield this.model
                    .findOneAndDelete(conditions, options)
                    .select(projection);
                return result;
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR, ctx: e });
            }
        });
    }
    deleteMany(conditions_1) {
        return __awaiter(this, arguments, void 0, function* (conditions, options = { new: true, runValidators: true }) {
            try {
                return yield this.model
                    .deleteMany(conditions, options);
            }
            catch (e) {
                console.log(e);
                throw new App_1.CustomError({ message: http_status_codes_1.ReasonPhrases.INTERNAL_SERVER_ERROR, ctx: e });
            }
        });
    }
    getModel() {
        return this.model;
    }
}
exports.DbRepository = DbRepository;

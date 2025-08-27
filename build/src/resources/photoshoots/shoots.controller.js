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
const App_1 = require("../../helpers/lib/App");
const constants_1 = require("../../helpers/constants");
class ShootsController {
    constructor() {
        this.getShoots = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: [],
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to get shoots', code: 500 }));
            }
        });
        this.getShoot = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: {},
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to get shoot', code: 500 }));
            }
        });
        this.createShoot = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(201).json({
                    msg: constants_1.ResponseMessage.CREATED,
                    data: {},
                    statusCode: 201
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to create shoot', code: 500 }));
            }
        });
        this.updateShoot = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: {},
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to update shoot', code: 500 }));
            }
        });
        this.deleteShoot = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: {},
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to delete shoot', code: 500 }));
            }
        });
    }
}
exports.default = ShootsController;

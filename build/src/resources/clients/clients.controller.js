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
exports.ClientsController = void 0;
const App_1 = require("../../helpers/lib/App");
const constants_1 = require("../../helpers/constants");
class ClientsController {
    constructor() {
        this.getClients = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement get clients logic
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: [],
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to get clients', code: 500 }));
            }
        });
        this.getClient = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement get single client logic
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: {},
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to get client', code: 500 }));
            }
        });
        this.createClient = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement create client logic
                res.status(201).json({
                    msg: constants_1.ResponseMessage.CREATED,
                    data: {},
                    statusCode: 201
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to create client', code: 500 }));
            }
        });
        this.updateClient = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement update client logic
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: {},
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to update client', code: 500 }));
            }
        });
        this.deleteClient = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // TODO: Implement delete client logic
                res.status(200).json({
                    msg: constants_1.ResponseMessage.OK,
                    data: {},
                    statusCode: 200
                });
            }
            catch (error) {
                next(new App_1.CustomError({ message: 'Failed to delete client', code: 500 }));
            }
        });
    }
}
exports.ClientsController = ClientsController;
exports.default = ClientsController;

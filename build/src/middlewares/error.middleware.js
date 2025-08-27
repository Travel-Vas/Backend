"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const App_1 = require("../helpers/lib/App");
const constants_1 = require("../helpers/constants");
const multer_1 = __importDefault(require("multer"));
const errorHandler = (err, req, res, next) => {
    console.log(err);
    if (err instanceof App_1.CustomError) {
        const { statusCode, message, logging, error } = err;
        if (constants_1.NODE_ENV == 'development') {
            console.log(error);
            // logger.error(
            //   JSON.stringify({
            //     code: statusCode,
            //     errors: error,
            //     stack: err.stack,
            //   }),
            // );
        }
        else {
            console.log(error.ctx);
            // logger.error('', { data: error.ctx})
        }
        return res.status(statusCode).json({
            msg: message,
            statusCode,
            data: [],
        });
    }
    if (err instanceof multer_1.default.MulterError) {
        return res.status(400).json({
            msg: 'Incorrect file field',
            statusCode: 400,
            data: [],
        });
    }
    return res.status(500).json({
        msg: constants_1.ResponseMessage.INTERNAL_SERVER_ERROR,
        statusCode: 500,
        data: [],
    });
};
exports.errorHandler = errorHandler;

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
exports.validationMiddleware = validationMiddleware;
const constants_1 = require("../helpers/constants");
function validationMiddleware(schema) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        try {
            req.body = yield schema.validateAsync(Object.assign(Object.assign({}, req.body), req.params), validationOptions);
            next();
        }
        catch (e) {
            const errors = [];
            e.details.forEach((error) => {
                errors.push({ message: error.message.replace(/\\"|"/g, ''), path: error.path[0] });
            });
            return res.status(400).json({
                msg: constants_1.ResponseMessage.BAD_REQUEST,
                statusCode: 400,
                data: errors,
            });
        }
    });
}

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
exports.supportController = void 0;
const support_service_1 = require("./support.service");
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const supportController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const message = {
        category: req.body.category,
        message: req.body.message,
    };
    const response = yield (0, support_service_1.supportService)(message, userId);
    res.json({
        msg: "Message sent successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.supportController = supportController;

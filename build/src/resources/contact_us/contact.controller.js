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
exports.contactController = void 0;
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const contact_service_1 = require("./contact.service");
const contactController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        fullName: req.body.fullName,
        email: req.body.email,
        message: req.body.message,
        clientId: req.body.clientId,
    };
    if (!payload.message || !payload.email || !payload.fullName) {
        throw new App_1.CustomError({
            message: "Missing fields",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, contact_service_1.contactService)(payload);
    res.json({
        msg: "success",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
    });
});
exports.contactController = contactController;

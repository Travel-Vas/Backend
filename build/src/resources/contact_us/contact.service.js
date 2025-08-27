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
exports.contactService = void 0;
const contacts_model_1 = __importDefault(require("./contacts.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../helpers/constants");
const contactService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.clientId && !mongoose_1.default.Types.ObjectId.isValid(payload.clientId)) {
        throw new App_1.CustomError({
            message: "Invalid Client Id",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield contacts_model_1.default.create(payload);
    yield new App_1.EmailService().contactUsNotificationMail(`New notification from ${payload.fullName}`, constants_1.ADMIN_MAIL, payload.fullName, payload.email, payload.message, "https://www.fotolocker.io");
    return response;
});
exports.contactService = contactService;

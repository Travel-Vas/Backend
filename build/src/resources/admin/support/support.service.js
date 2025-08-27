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
exports.supportService = void 0;
const App_1 = require("../../../helpers/lib/App");
const slack_logger_1 = require("../../../utils/slack-logger");
const user_model_1 = __importDefault(require("../../users/user.model"));
const supportService = (message, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_details = yield user_model_1.default.findOne({
            _id: userId
        }).lean().exec();
        const newMessage = Object.assign(Object.assign({}, message), { name: user_details === null || user_details === void 0 ? void 0 : user_details.business_name, email: user_details === null || user_details === void 0 ? void 0 : user_details.email });
        const response = yield (0, slack_logger_1.slackLogger)(newMessage);
        return response;
    }
    catch (err) {
        throw new App_1.CustomError({
            message: err.message,
            code: err.code,
        });
    }
});
exports.supportService = supportService;

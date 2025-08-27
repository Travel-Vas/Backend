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
exports.getLocationDetails = void 0;
const App_1 = require("../App");
const http_status_codes_1 = require("http-status-codes");
const axios_1 = __importDefault(require("axios"));
const getLocationDetails = (IP) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://ipapi.co/${IP}/json`);
        return response === null || response === void 0 ? void 0 : response.data;
    }
    catch (error) {
        console.log(error);
        throw new App_1.CustomError({
            message: 'Error fetching location details',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.getLocationDetails = getLocationDetails;

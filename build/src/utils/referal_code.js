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
exports.codeGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const referal_model_1 = require("../resources/referal/referal.model");
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const codeGenerator = (businessName) => __awaiter(void 0, void 0, void 0, function* () {
    const idPart = businessName.replace(/\s+/g, ''); // Get last 6 characters of user ID
    let code = '';
    let isUnique = false;
    while (!isUnique) {
        const randomPart = crypto_1.default.randomBytes(3).toString('hex').slice(0, 6); // 6-char random hex
        code = `${idPart}${randomPart}`;
        const existing = yield referal_model_1.referalModel.findOne({ referralCode: code });
        if (!existing) {
            isUnique = true;
        }
        else {
            throw new App_1.CustomError({
                message: 'Referral code already exists',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
    }
    return code;
});
exports.codeGenerator = codeGenerator;

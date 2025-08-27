"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paystack = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const paystack_1 = __importDefault(require("paystack"));
dotenv_1.default.config();
const secretKey = process.env.PAYSTACK_SECRET_KEY;
if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined in environment variables.");
}
exports.paystack = (0, paystack_1.default)(secretKey);

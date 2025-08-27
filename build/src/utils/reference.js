"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
function generateTransactionReference(userId) {
    const timestamp = Date.now();
    const rawString = `${userId}-${timestamp}`;
    const hash = crypto_1.default.createHash('sha256').update(rawString).digest('hex').slice(0, 12);
    return `TX-${hash}`;
}
exports.default = generateTransactionReference;

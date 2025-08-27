"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
const http_status_codes_1 = require("http-status-codes");
class CustomError extends Error {
    constructor(errorParams) {
        const { code, message, logging, ctx } = errorParams;
        super(message);
        this._statusCode = code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
        this._ctx = ctx || {};
        this._logging = logging || false;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
    get error() {
        return { message: this.message, ctx: this._ctx };
    }
    get statusCode() {
        return this._statusCode;
    }
    get logging() {
        return this._logging;
    }
}
exports.CustomError = CustomError;

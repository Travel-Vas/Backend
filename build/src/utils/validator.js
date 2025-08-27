"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFields = void 0;
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const validateFields = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            throw new App_1.CustomError({
                message: `${key} is required`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
    }
};
exports.validateFields = validateFields;

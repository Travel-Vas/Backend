"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET_KEY = exports.AWS_SES_REGION = exports.AWS_SECRET_ACCESS_KEY = exports.AWS_ACCESS_KEY = exports.EMAIL_HOST = exports.EMAIL_PASSWORD = exports.EMAIL = exports.REDIS_PORT = exports.REDIS_HOST = exports.REDIS_PASSWORD = exports.REDIS_USERNAME = exports.NODE_ENV = exports.DATABASE = exports.EMAIL_PORT = exports.PORT = exports.isDev = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const App_1 = require("../lib/App");
const application_constants_1 = require("./application.constants");
dotenv_1.default.config();
exports.isDev = process.env.NODE_ENV !== "production";
const requiredEnvs = [
    "DATABASE",
    "NODE_ENV",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
    "REDIS_HOST",
    "REDIS_PORT",
    // 'EMAIL',
    // 'EMAIL_PASSWORD',
    // 'GOOGLE_CLIENT_ID',
    // 'GOOGLE_CLIENT_SECRET',
    "JWT_SECRET_KEY",
    // 'EMAIL_HOST',
    // 'ClOUDINARY_CLOUD_NAME',
    // 'ClOUDINARY_API_KEY',
    // 'ClOUDINARY_API_SECRET',
    // 'CLOUDINARY_URL',
];
const envs = requiredEnvs.reduce((acc, key) => {
    acc[key] = process.env[key];
    return acc;
}, {});
const missingEnvs = requiredEnvs.filter((key) => !envs[key]);
if (missingEnvs.length > 0 || !process.env.PORT) {
    console.error("ENV Error, the following ENV variables are not set:");
    missingEnvs.push("PORT");
    console.table(missingEnvs);
    throw new App_1.CustomError({
        message: application_constants_1.ResponseMessage.ENV_NOT_FOUND,
        code: 500,
    });
}
exports.PORT = Number(process.env.PORT);
exports.EMAIL_PORT = Number(process.env.EMAIL_PORT);
exports.DATABASE = envs.DATABASE, exports.NODE_ENV = envs.NODE_ENV, exports.REDIS_USERNAME = envs.REDIS_USERNAME, exports.REDIS_PASSWORD = envs.REDIS_PASSWORD, exports.REDIS_HOST = envs.REDIS_HOST, exports.REDIS_PORT = envs.REDIS_PORT, exports.EMAIL = envs.EMAIL, exports.EMAIL_PASSWORD = envs.EMAIL_PASSWORD, exports.EMAIL_HOST = envs.EMAIL_HOST, exports.AWS_ACCESS_KEY = envs.AWS_ACCESS_KEY, exports.AWS_SECRET_ACCESS_KEY = envs.AWS_SECRET_ACCESS_KEY, exports.AWS_SES_REGION = envs.AWS_SES_REGION, exports.JWT_SECRET_KEY = envs.JWT_SECRET_KEY;

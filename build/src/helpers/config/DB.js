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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    serverSelectionTimeoutMS: 60000,
};
class DB {
    constructor(log) {
        this.log = log;
    }
    connect(DB_URL) {
        const log = this.log;
        mongoose_1.default.set('strictQuery', false);
        mongoose_1.default
            .connect(DB_URL, options)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            log.info(`========================================================`);
            log.info(`Successfully connected to `, { data: "Database" });
            log.info(`========================================================`);
        }))
            .catch((err) => {
            log.error(`There was a db connection error`, err);
            process.exit(0);
        });
        mongoose_1.default.connection.once('disconnected', () => {
            log.error(`Successfully disconnected from Database`);
        });
        process.on('SIGINT', () => {
            mongoose_1.default.connection.close().then(() => {
                log.error('dBase connection closed due to app termination');
                process.exit(0);
            });
        });
    }
}
exports.default = DB;

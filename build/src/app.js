"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis_client = void 0;
require("dotenv/config");
const server_1 = __importDefault(require("./server"));
const constants_1 = require("./helpers/constants");
const routes_1 = __importDefault(require("./routes"));
const DB_1 = __importDefault(require("./helpers/config/DB"));
const redis_client_1 = __importDefault(require("./helpers/config/redis-client"));
const constants_2 = require("./helpers/constants");
// import RabbitMQ from './helpers/lib/App/rabbitMQ';
const app = new server_1.default(constants_1.PORT, routes_1.default, console);
const db = new DB_1.default(console);
exports.redis_client = new redis_client_1.default(constants_2.REDIS_HOST, constants_2.REDIS_PORT, constants_2.REDIS_USERNAME, constants_2.REDIS_PASSWORD, console);
// new RabbitMQ().connect()
//start application
exports.redis_client.connect();
db.connect(constants_1.DATABASE);
app.start();
// connect to database

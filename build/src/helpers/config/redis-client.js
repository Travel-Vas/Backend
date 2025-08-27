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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class RedisClient {
    constructor(host, port, username, password, log) {
        this.log = log;
        this.host = host;
        this.port = port;
        this.password = password;
        this.username = username;
        this.redisClient = (0, redis_1.createClient)({ url: `rediss://${this.username}:${this.password}@${this.host}:${this.port}` });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.redisClient.on("error", (error) => console.error(`Error : ${error}`));
            yield this.redisClient.connect().then(() => {
                this.log.log(`========================================================`);
                this.log.log('redis connected successfully');
                this.log.log(`========================================================`);
            });
        });
    }
    getRedisClient() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.redisClient;
        });
    }
}
exports.default = RedisClient;
